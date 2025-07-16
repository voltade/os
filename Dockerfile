# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.9-alpine AS base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

# Install Alpine packages needed for native dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libwebp-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    tiff-dev \
    giflib-dev \
    libde265-dev \
    libheif-dev \
    expat-dev \
    glib-dev

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . /app
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install --chown=bun:bun /temp/prod/node_modules /app/node_modules
COPY --from=build --chown=bun:bun /app/dist /app/dist
COPY --from=build --chown=bun:bun /app/drizzle.config.ts /app/drizzle.config.ts
COPY --from=build --chown=bun:bun /app/migrations /app/migrations
COPY --chown=bun:bun .env package.json /app/

# run the app
USER bun
EXPOSE 3000/tcp
ENV NODE_ENV=production
ENTRYPOINT [ "bun", "run", "dist/index.js" ]
# CMD ["sleep", "infinity"]
