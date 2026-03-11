import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// 빌드 번호: git 커밋 수 (푸시할 때마다 자동 증가)
let buildNumber = '0'
let commitSha = '000000'
try {
  buildNumber = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim()
  commitSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  // git 없는 환경(일부 CI) 대비 — Vercel은 git 사용 가능
}

// 표시 버전: "1.0.1 (b45)" 형태
const appVersion = `${pkg.version} (b${buildNumber})`

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_BUILD_NUMBER: buildNumber,
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
}

export default nextConfig
