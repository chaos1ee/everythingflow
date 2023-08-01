# DB 管理平台

## 使用

### 安装

```shell
pnpm install
```

### 开发

```shell
pnpm start
```

### 构建

```shell
pnpm build
```

## 以 Docker 容器的方式运行

### 构建

```shell
docker build -f Dockerfile.local --build-arg BACKEND_URL=${BACKEND_URL} -t [name]:[tag] .
```

`BACKEND_URL` 为后端服务的地址，前端容器内运行的 Nginx 会把请求转发到 `BACKEND_URL`。

### 启动容器

```shell
docker run -itd -p [port]:[port] [name]:[tag]
```

## TODO

- [ ] 全局更新 QueryList 的数据。
