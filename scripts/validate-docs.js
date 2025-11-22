#!/usr/bin/env node

/**
 * 문서 검증 스크립트
 *
 * 기능:
 * 1. YAML frontmatter 존재 확인
 * 2. 필수 필드 검증
 * 3. Tier별 라인 수 제한 확인
 * 4. 깨진 링크 확인
 * 5. 문서 통계 생성
 */

const fs = require('fs');
const path = require('path');

// 설정
const CONFIG = {
  rootDir: path.join(__dirname, '..'),
  docsDir: path.join(__dirname, '..', 'docs'),
  maxLines: {
    tier1: 200,
    tier2: 400,
    tier3: 300,
    tier4: Infinity
  },
  requiredFields: ['title', 'category', 'tier', 'status', 'last_updated']
};

// 결과 저장
const results = {
  totalFiles: 0,
  passedFiles: 0,
  errors: [],
  warnings: [],
  stats: {
    byTier: { 1: 0, 2: 0, 3: 0, 4: 0 },
    byCategory: {},
    totalLines: 0
  }
};

/**
 * YAML frontmatter 파싱
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const yamlContent = match[1];
  const metadata = {};

  // 간단한 YAML 파싱 (gray-matter 없이)
  const lines = yamlContent.split('\n');
  let currentKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.endsWith(':')) {
      // 배열 시작
      currentKey = trimmed.slice(0, -1).trim();
      metadata[currentKey] = [];
    } else if (trimmed.startsWith('- ')) {
      // 배열 항목
      if (currentKey && Array.isArray(metadata[currentKey])) {
        metadata[currentKey].push(trimmed.slice(2).trim());
      }
    } else if (trimmed.includes(': ')) {
      // 키-값 쌍
      const [key, ...valueParts] = trimmed.split(': ');
      const value = valueParts.join(': ').trim().replace(/^["']|["']$/g, '');
      metadata[key.trim()] = value;
      currentKey = null;
    }
  }

  return metadata;
}

/**
 * 파일의 라인 수 계산
 */
function countLines(content) {
  return content.split('\n').length;
}

/**
 * 링크 추출 (Markdown)
 */
function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }

  return links;
}

/**
 * 상대 경로 링크 검증
 */
function validateLinks(filePath, links) {
  const brokenLinks = [];
  const fileDir = path.dirname(filePath);

  for (const link of links) {
    const url = link.url;

    // 외부 링크는 건너뛰기
    if (url.startsWith('http://') || url.startsWith('https://')) {
      continue;
    }

    // Anchor만 있는 링크는 건너뛰기
    if (url.startsWith('#')) {
      continue;
    }

    // 상대 경로 해석
    const [pathPart] = url.split('#');
    let targetPath;

    if (pathPart.startsWith('/')) {
      // 절대 경로
      targetPath = path.join(CONFIG.rootDir, pathPart);
    } else {
      // 상대 경로
      targetPath = path.resolve(fileDir, pathPart);
    }

    // 파일 존재 확인
    if (!fs.existsSync(targetPath)) {
      brokenLinks.push({
        link: url,
        text: link.text
      });
    }
  }

  return brokenLinks;
}

/**
 * 단일 파일 검증
 */
function validateFile(filePath) {
  results.totalFiles++;

  const relativePath = path.relative(CONFIG.rootDir, filePath);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = countLines(content);
  const metadata = parseFrontmatter(content);
  const links = extractLinks(content);

  let hasError = false;

  // 1. Frontmatter 확인 (Hot Docs는 제외 가능)
  const isHotDoc = filePath.endsWith('CLAUDE.md') || filePath.endsWith('prd.md');

  if (!metadata && !isHotDoc) {
    results.errors.push({
      file: relativePath,
      type: 'missing-frontmatter',
      message: 'YAML frontmatter가 없습니다'
    });
    hasError = true;
  }

  // 2. 필수 필드 확인
  if (metadata) {
    for (const field of CONFIG.requiredFields) {
      if (!metadata[field]) {
        results.errors.push({
          file: relativePath,
          type: 'missing-field',
          message: `필수 필드 누락: ${field}`
        });
        hasError = true;
      }
    }

    // 3. Tier별 라인 수 확인
    const tier = parseInt(metadata.tier);
    if (tier && tier >= 1 && tier <= 4) {
      const maxLines = CONFIG.maxLines[`tier${tier}`];
      if (lines > maxLines) {
        results.warnings.push({
          file: relativePath,
          type: 'line-limit',
          message: `Tier ${tier} 라인 수 초과: ${lines}줄 (최대 ${maxLines}줄)`
        });
      }

      // 통계
      results.stats.byTier[tier]++;
      results.stats.totalLines += lines;
    }

    // 카테고리 통계
    if (metadata.category) {
      results.stats.byCategory[metadata.category] =
        (results.stats.byCategory[metadata.category] || 0) + 1;
    }
  } else if (isHotDoc) {
    // Hot Docs 라인 수 확인
    if (lines > CONFIG.maxLines.tier1) {
      results.warnings.push({
        file: relativePath,
        type: 'line-limit',
        message: `Hot Doc 라인 수 초과: ${lines}줄 (권장 ${CONFIG.maxLines.tier1}줄 이하)`
      });
    }
    results.stats.totalLines += lines;
  }

  // 4. 링크 검증
  const brokenLinks = validateLinks(filePath, links);
  if (brokenLinks.length > 0) {
    for (const broken of brokenLinks) {
      results.warnings.push({
        file: relativePath,
        type: 'broken-link',
        message: `깨진 링크: [${broken.text}](${broken.link})`
      });
    }
  }

  if (!hasError) {
    results.passedFiles++;
  }
}

/**
 * 디렉토리 재귀 탐색
 */
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // node_modules, .git 등 제외
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.md')) {
      callback(filePath);
    }
  }
}

/**
 * 리포트 생성
 */
function generateReport() {
  console.log('\n='.repeat(60));
  console.log('📚 문서 검증 리포트');
  console.log('='.repeat(60));

  // 통계
  console.log('\n📊 통계');
  console.log(`  - 총 문서 수: ${results.totalFiles}`);
  console.log(`  - 검증 통과: ${results.passedFiles}`);
  console.log(`  - 오류 발생: ${results.errors.length}`);
  console.log(`  - 경고: ${results.warnings.length}`);
  console.log(`  - 총 라인 수: ${results.stats.totalLines.toLocaleString()}`);

  console.log('\n  Tier별 문서 수:');
  for (let tier = 1; tier <= 4; tier++) {
    console.log(`    - Tier ${tier}: ${results.stats.byTier[tier] || 0}개`);
  }

  console.log('\n  카테고리별 문서 수:');
  for (const [category, count] of Object.entries(results.stats.byCategory)) {
    console.log(`    - ${category}: ${count}개`);
  }

  // 오류
  if (results.errors.length > 0) {
    console.log('\n❌ 오류');
    for (const error of results.errors) {
      console.log(`  [${error.type}] ${error.file}`);
      console.log(`    → ${error.message}`);
    }
  }

  // 경고
  if (results.warnings.length > 0) {
    console.log('\n⚠️  경고');
    const groupedWarnings = {};
    for (const warning of results.warnings) {
      if (!groupedWarnings[warning.type]) {
        groupedWarnings[warning.type] = [];
      }
      groupedWarnings[warning.type].push(warning);
    }

    for (const [type, warnings] of Object.entries(groupedWarnings)) {
      console.log(`\n  ${type} (${warnings.length}개):`);
      for (const warning of warnings.slice(0, 10)) {
        console.log(`    - ${warning.file}`);
        console.log(`      ${warning.message}`);
      }
      if (warnings.length > 10) {
        console.log(`    ... 외 ${warnings.length - 10}개`);
      }
    }
  }

  // 결과
  console.log('\n='.repeat(60));
  if (results.errors.length === 0) {
    console.log('✅ 검증 완료! (오류 없음)');
    if (results.warnings.length > 0) {
      console.log(`⚠️  ${results.warnings.length}개의 경고가 있습니다.`);
    }
  } else {
    console.log(`❌ 검증 실패! (${results.errors.length}개 오류)`);
  }
  console.log('='.repeat(60) + '\n');

  // JSON 파일로 저장
  const reportPath = path.join(CONFIG.rootDir, 'docs', 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 상세 리포트: ${path.relative(CONFIG.rootDir, reportPath)}`);

  return results.errors.length === 0;
}

/**
 * 메인 실행
 */
function main() {
  console.log('🔍 문서 검증 시작...\n');

  // Hot Docs 검증
  const hotDocs = [
    path.join(CONFIG.rootDir, 'CLAUDE.md'),
    path.join(CONFIG.rootDir, 'prd.md')
  ];

  for (const hotDoc of hotDocs) {
    if (fs.existsSync(hotDoc)) {
      validateFile(hotDoc);
    }
  }

  // docs/ 디렉토리 검증
  if (fs.existsSync(CONFIG.docsDir)) {
    walkDir(CONFIG.docsDir, validateFile);
  }

  // DOCUMENTATION_STANDARD.md도 검증
  const standardDoc = path.join(CONFIG.rootDir, 'DOCUMENTATION_STANDARD.md');
  if (fs.existsSync(standardDoc)) {
    validateFile(standardDoc);
  }

  // 리포트 생성
  const success = generateReport();

  process.exit(success ? 0 : 1);
}

// 실행
main();
