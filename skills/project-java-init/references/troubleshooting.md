# 常见报错速查表

| 报错信息 | 原因 | 解决方案 |
|----------|------|----------|
| `Failed to configure a DataSource` | yml 数据库配置缺失或缩进错误 | 检查 yml 格式，确认数据库名填写正确 |
| `Consider defining a bean of type '...mapper...'` | 缺少 @MapperScan 注解 | 在启动类加 `@MapperScan("你的包名.mapper")` |
| `Bean named 'sqlSessionFactory' is not assignable` | MyBatis 和 MyBatis-Plus 并存冲突 | 确保已删除 `mybatis-spring-boot-starter` |
| CORS error（浏览器控制台） | 跨域未配置，或前端端口写错 | 检查 `CorsConfig.java` 是否存在，检查 `request.ts` 里的端口号 |
| `ReferenceError: require is not defined` | ES Module 项目里用了 CommonJS 语法 | `openapi.config.js` 改用 `import` 写法 |
| `Cannot find module '@/...'` | 路径别名未生效，或文件不存在 | 检查 `vite.config.ts` 的 alias，确认文件已创建 |
| `Property 'spring.mvc.pathmatch...' incompatible` | Spring Boot 3.x 不支持 ant_path_matcher | 删除 yml 里的 `pathmatch` 配置块 |
| `java.lang.reflect.InaccessibleObjectException` | Java 17+ 模块化限制 | 检查 Hutool 版本，建议升级到 6.x 或添加 JVM 参数 `--add-opens` |
