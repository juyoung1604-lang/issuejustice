import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // package.json 버전을 빌드 타임에 주입 — 배포할 때마다 자동 반영
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    // 빌드 시각 (ISO)
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
}

export default nextConfig
