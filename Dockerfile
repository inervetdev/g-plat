FROM tomcat:9.0-jdk11

# 작업 디렉토리 설정
WORKDIR /usr/local/tomcat

# 한글 인코딩 설정
ENV LANG=ko_KR.UTF-8
ENV LANGUAGE=ko_KR.UTF-8
ENV LC_ALL=ko_KR.UTF-8

# 타임존 설정
RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

# JSTL 라이브러리 추가
RUN apt-get update && apt-get install -y wget \
    && wget https://repo1.maven.org/maven2/javax/servlet/jstl/1.2/jstl-1.2.jar \
    -P /usr/local/tomcat/lib/ \
    && wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.33/mysql-connector-java-8.0.33.jar \
    -P /usr/local/tomcat/lib/ \
    && rm -rf /var/lib/apt/lists/*

# Tomcat 관리자 설정 (개발용)
COPY tomcat-users.xml /usr/local/tomcat/conf/
COPY context.xml /usr/local/tomcat/webapps/manager/META-INF/

# 기본 ROOT 앱 제거
RUN rm -rf /usr/local/tomcat/webapps/ROOT

# JSP 파일 복사 (빌드 시점에)
COPY ./webapps /usr/local/tomcat/webapps/

# 포트 노출
EXPOSE 8080

# Tomcat 실행
CMD ["catalina.sh", "run"]