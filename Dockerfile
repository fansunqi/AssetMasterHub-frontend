# TODO Start: [Student] Complete Dockerfile
# Stage 0: build
FROM node:18 AS build

ENV FRONTEND=/opt/frontend

WORKDIR $FRONTEND

# 在 GitLab 平台上执行 CI/CD 时，这里的主机文件系统实际上是我们的仓库，因此 COPY . . 
# 实际上是将仓库中的所有文件复制到了镜像的工作目录。因此，不用担心庞大的 node_modules 会带来什么负担。
COPY . .

RUN yarn config set registry https://registry.npm.taobao.org

RUN yarn install

RUN yarn run build

RUN yarn run export

# Stage 1
FROM nginx:1.22

ENV HOME=/opt/app

WORKDIR $HOME

COPY --from=build /opt/frontend/out dist

COPY nginx /etc/nginx/conf.d

EXPOSE 80
# TODO End