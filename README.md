# 철거창업소 랜딩페이지

무촌 스타일 다크 원페이지 랜딩. 프레임워크 없는 정적 사이트라 빌드 과정이 없음.

## 로컬 확인

빌드 도구 불필요. 아래 중 하나로 실행.

```bash
# 방법 1. 정적 서버 (권장)
npx serve landing

# 방법 2. 파이썬 내장 서버
cd landing && python3 -m http.server 5500
```

브라우저에서 `http://localhost:3000` (serve) 또는 `http://localhost:5500` 접속.

## Vercel 배포

무설정 정적 배포.

```bash
cd landing
vercel        # 미리보기 배포
vercel --prod # 프로덕션 배포
```

Vercel 대시보드에서 폴더를 연결할 경우 Framework Preset은 `Other`, Output Directory는 비워둠 (루트의 index.html 자동 서빙).

## 구성

```
landing/
  index.html    6개 섹션 마크업 + 상담 모달
  styles.css    다크 테마, 스탠드형 컬럼(모바일/PC 공통), 코인 페이드
  script.js     모달 열고닫기 + 이름/전화 검증 + 대표님 전화 연결
  assets/       히어로 캐릭터, 코인, 픽토그램 등 이미지
```

## CTA 동작

CTA 버튼(히어로, 마무리 섹션) 클릭 → 상담 모달 팝업. 모달 안에 두 개의 버튼이 있음.

1. 상담 신청하기 → 이름/연락처를 담당자 메일(`kachi9806@gmail.com`)로 접수. 성공 시 접수 완료 화면 표시.
2. 전화 상담 바로하기 → 담당자 전화(`010-3650-9807`)로 연결(`tel:`). 모바일에서 다이얼러가 열림.

### 상담 신청 메일 전달 (Formsubmit)

메일 전달은 서버 없이 [Formsubmit](https://formsubmit.co) 무료 서비스를 사용함 (`script.js`의 `FORM_ENDPOINT`).

- **최초 1회 활성화 필요**: 첫 신청이 들어오면 `kachi9806@gmail.com` 으로 활성화 확인 메일이 도착함. 그 메일의 링크를 한 번 눌러야 이후 신청이 정상 수신됨. (배포 후 실제로 한 번 신청해서 활성화 권장)
- 수신 메일 변경: `script.js`의 `LEAD_EMAIL` 상수 수정.
- 대표님 번호 변경: `script.js`의 `OWNER_TEL` 상수 수정.
- 입력값은 브라우저 `localStorage`(`cheolgeo_leads`)에도 백업됨.

자체 서버리스 함수(Vercel Functions + Resend/SMTP)로 바꾸려면 `/api/lead` 라우트를 추가하고 `FORM_ENDPOINT`를 해당 경로로 교체하면 됨. (API 키 필요)

## 교체 필요 항목 (배포 전)

- 하단 사업자등록번호(`000-00-00000`) 실제 값으로 교체.
- 상담받기 폼 제거 관련 최종 확인 사항 반영.
