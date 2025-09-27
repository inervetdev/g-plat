-- 지플랫 데이터베이스 초기화 스크립트
CREATE DATABASE IF NOT EXISTS gplat DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gplat;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    domain_name VARCHAR(100) UNIQUE,
    profile_image_url TEXT,
    subscription_tier ENUM('FREE', 'PREMIUM', 'BUSINESS') DEFAULT 'FREE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_domain (domain_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id BIGINT PRIMARY KEY,
    company VARCHAR(255),
    position VARCHAR(100),
    title VARCHAR(100),
    bio TEXT,
    address TEXT,
    social_links JSON,
    theme_settings JSON,
    callback_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 부업 카드 테이블
CREATE TABLE IF NOT EXISTS sidejob_cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    price VARCHAR(100),
    cta_text VARCHAR(100),
    cta_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_active (user_id, is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 방문자 통계 테이블
CREATE TABLE IF NOT EXISTS visitor_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    visitor_ip VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_date (user_id, visit_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 콜백 로그 테이블
CREATE TABLE IF NOT EXISTS callback_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    phone_number VARCHAR(20),
    message TEXT,
    status ENUM('PENDING', 'SENT', 'FAILED') DEFAULT 'PENDING',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 샘플 데이터 삽입
INSERT INTO users (email, password, name, phone, domain_name, subscription_tier) VALUES
('demo@gplat.kr', 'password123', '김대리', '010-1234-5678', '김대리', 'PREMIUM'),
('test@gplat.kr', 'password123', '이과장', '010-2345-6789', '이과장', 'FREE');

INSERT INTO user_profiles (user_id, company, position, title, bio, address) VALUES
(1, 'ABC 컴퍼니', '마케팅 매니저', '디지털 마케팅 전문가', '10년차 디지털 마케팅 전문가입니다. 성과 중심의 마케팅 전략을 제공합니다.', '서울시 강남구 테헤란로 123'),
(2, 'XYZ 코퍼레이션', '영업 팀장', '영업 전문가', '15년차 B2B 영업 전문가입니다.', '서울시 서초구 강남대로 456');

INSERT INTO sidejob_cards (user_id, title, description, price, display_order) VALUES
(1, '프리미엄 정수기 렌탈', '최신형 직수형 정수기를 합리적인 가격으로 만나보세요', '월 29,900원부터', 1),
(1, '자동차 보험 컨설팅', '최대 30% 할인 혜택과 맞춤형 설계 서비스', '무료 상담', 2),
(1, '디지털 마케팅 강의', '실무자가 직접 알려주는 마케팅 전략과 노하우', '99,000원/월', 3);