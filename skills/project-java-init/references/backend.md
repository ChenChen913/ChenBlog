# 后端代码模板

使用 `{BASE_PACKAGE}` 作为包名占位符（例如：`com.yupi.project`）。
使用 `{PORT}` 作为端口号占位符。
使用 `{PROJECT_NAME}` 作为项目名占位符。
使用 `{DB_NAME}` 作为数据库名占位符。
使用 `{DB_PASSWORD}` 作为数据库密码占位符。

## 阶段一：Git 初始化

🤖 AI 生成代码：.gitignore

```text
target/
*.class
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar

# IDE
.idea/
*.iml
*.ipr
*.iws
.classpath
.project
.settings/
.vscode/

# Logs
*.log
logs/

# System
.DS_Store
Thumbs.db

# Maven
mvnw
mvnw.cmd
.mvn/

# Local Config (Important: Do not commit passwords)
application-local.yml
```

## 阶段二：配置 application.yml

建议使用多环境配置，将敏感信息（如数据库密码）放在 `application-local.yml` 中，并将其加入 `.gitignore`。

🤖 AI 生成代码：application.yml (主配置文件)

```yaml
server:
  port: {PORT}
  servlet:
    context-path: /api
spring:
  application:
    name: {PROJECT_NAME}
  profiles:
    active: local
  # Spring Boot 2.x 专用配置 (Spring Boot 3.x 请删除此配置块)
  mvc:
    pathmatch:
      matching-strategy: ant_path_matcher
```

🤖 AI 生成代码：application-local.yml (本地配置文件，包含密码)

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/{DB_NAME}?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: {DB_PASSWORD}
```

## 阶段三：依赖配置 (pom.xml & yml)

### 1. MyBatis-Plus

🤖 AI 生成代码：pom.xml 依赖

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>{MYBATIS_PLUS_ARTIFACT_ID}</artifactId>
    <version>{MYBATIS_PLUS_VERSION}</version>
</dependency>
```

🤖 AI 生成代码：application.yml 追加配置

```yaml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: false
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      logic-delete-field: isDelete # 逻辑删除字段
      logic-delete-value: 1 # 逻辑已删除值(默认为 1)
      logic-not-delete-value: 0 # 逻辑未删除值(默认为 0)
```

### 2. Hutool 工具库

🤖 AI 生成代码：pom.xml 依赖

```xml
<dependency>
    <groupId>cn.hutool</groupId>
    <artifactId>hutool-all</artifactId>
    <version>{HUTOOL_VERSION}</version>
</dependency>
```

### 3. Knife4j 接口文档

🤖 AI 生成代码：pom.xml 依赖

```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>{KNIFE4J_ARTIFACT_ID}</artifactId>
    <version>{KNIFE4J_VERSION}</version>
</dependency>
```

🤖 AI 生成代码：application.yml 追加配置

```yaml
knife4j:
  enable: true
  openapi:
    title: "接口文档"
    version: 1.0
    group:
      default:
        api-rule: package
        api-rule-resources:
          - {BASE_PACKAGE}.controller
```

### 4. AOP 切面编程 (可选)

🤖 AI 生成代码：pom.xml 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

## 阶段四：通用基础代码

🤖 AI 生成代码：通用类

### exception/ErrorCode.java
```java
package {BASE_PACKAGE}.exception;

/**
 * 自定义错误码
 */
public enum ErrorCode {

    SUCCESS(0, "ok"),
    PARAMS_ERROR(40000, "请求参数错误"),
    NOT_LOGIN_ERROR(40100, "未登录"),
    NO_AUTH_ERROR(40101, "无权限"),
    NOT_FOUND_ERROR(40400, "请求数据不存在"),
    FORBIDDEN_ERROR(40300, "禁止访问"),
    SYSTEM_ERROR(50000, "系统内部异常"),
    OPERATION_ERROR(50001, "操作失败");

    /**
     * 状态码
     */
    private final int code;

    /**
     * 信息
     */
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
```

### exception/BusinessException.java
```java
package {BASE_PACKAGE}.exception;

/**
 * 自定义业务异常
 */
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.code = errorCode.getCode();
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.code = errorCode.getCode();
    }

    public int getCode() {
        return code;
    }
}
```

### exception/ThrowUtils.java
```java
package {BASE_PACKAGE}.exception;

/**
 * 抛异常工具类
 */
public class ThrowUtils {

    /**
     * 如果条件成立，则抛出异常
     *
     * @param condition
     * @param runtimeException
     */
    public static void throwIf(boolean condition, RuntimeException runtimeException) {
        if (condition) {
            throw runtimeException;
        }
    }

    /**
     * 如果条件成立，则抛出异常
     *
     * @param condition
     * @param errorCode
     */
    public static void throwIf(boolean condition, ErrorCode errorCode) {
        throwIf(condition, new BusinessException(errorCode));
    }

    /**
     * 如果条件成立，则抛出异常
     *
     * @param condition
     * @param errorCode
     * @param message
     */
    public static void throwIf(boolean condition, ErrorCode errorCode, String message) {
        throwIf(condition, new BusinessException(errorCode, message));
    }
}
```

### exception/GlobalExceptionHandler.java
```java
package {BASE_PACKAGE}.exception;

import {BASE_PACKAGE}.common.BaseResponse;
import {BASE_PACKAGE}.common.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public BaseResponse<?> businessExceptionHandler(BusinessException e) {
        log.error("BusinessException", e);
        return ResultUtils.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public BaseResponse<?> runtimeExceptionHandler(RuntimeException e) {
        log.error("RuntimeException", e);
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统错误");
    }
}
```

### common/BaseResponse.java
```java
package {BASE_PACKAGE}.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 通用返回类
 *
 * @param <T>
 */
@Data
public class BaseResponse<T> implements Serializable {

    private int code;

    private T data;

    private String message;

    public BaseResponse(int code, T data, String message) {
        this.code = code;
        this.data = data;
        this.message = message;
    }

    public BaseResponse(int code, T data) {
        this(code, data, "");
    }

    public BaseResponse(ErrorCode errorCode) {
        this(errorCode.getCode(), null, errorCode.getMessage());
    }
}
```

### common/ResultUtils.java
```java
package {BASE_PACKAGE}.common;

import {BASE_PACKAGE}.exception.ErrorCode;

/**
 * 返回工具类
 */
public class ResultUtils {

    /**
     * 成功
     *
     * @param data
     * @param <T>
     * @return
     */
    public static <T> BaseResponse<T> success(T data) {
        return new BaseResponse<>(0, data, "ok");
    }

    /**
     * 失败
     *
     * @param errorCode
     * @return
     */
    public static BaseResponse error(ErrorCode errorCode) {
        return new BaseResponse<>(errorCode);
    }

    /**
     * 失败
     *
     * @param code
     * @param message
     * @return
     */
    public static BaseResponse error(int code, String message) {
        return new BaseResponse(code, null, message);
    }

    /**
     * 失败
     *
     * @param errorCode
     * @return
     */
    public static BaseResponse error(ErrorCode errorCode, String message) {
        return new BaseResponse(errorCode.getCode(), null, message);
    }
}
```

### common/PageRequest.java
```java
package {BASE_PACKAGE}.common;

import lombok.Data;

/**
 * 分页请求
 */
@Data
public class PageRequest {

    /**
     * 当前页号
     */
    private int current = 1;

    /**
     * 页面大小
     */
    private int pageSize = 10;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序顺序（默认降序）
     */
    private String sortOrder = "descend";
}
```

### common/DeleteRequest.java
```java
package {BASE_PACKAGE}.common;

import java.io.Serializable;
import lombok.Data;

/**
 * 删除请求
 */
@Data
public class DeleteRequest implements Serializable {

    /**
     * id
     */
    private Long id;

    private static final long serialVersionUID = 1L;
}
```

### config/CorsConfig.java
```java
package {BASE_PACKAGE}.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 全局跨域配置
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 覆盖所有请求
        registry.addMapping("/**")
                // 允许发送 Cookie
                .allowCredentials(true)
                // 放行哪些域名（必须用 patterns，否则 * 会和 allowCredentials 冲突）
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("*");
    }
}
```

### controller/MainController.java
```java
package {BASE_PACKAGE}.controller;

import {BASE_PACKAGE}.common.BaseResponse;
import {BASE_PACKAGE}.common.ResultUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 主控制器（健康检查）
 */
@RestController
@RequestMapping("/")
public class MainController {

    /**
     * 健康检查
     *
     * @return
     */
    @GetMapping("/health")
    public BaseResponse<String> health() {
        return ResultUtils.success("ok");
    }
}
```
