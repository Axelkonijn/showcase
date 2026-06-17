FROM mcr.microsoft.com/playwright:v1.58.0-jammy

WORKDIR /e2e

COPY Showcase.E2E/package.json ./

RUN npm install

COPY Showcase.E2E/ .

CMD ["npx", "playwright", "test"]