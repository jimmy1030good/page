# 아주르 프로밀리아 정보 뷰어

아주르 프로밀리아 게임의 캐릭터와 키보 정보를 확인할 수 있는 웹 애플리케이션입니다.

## 🌟 주요 기능

### 📋 캐릭터 & 키보 정보
- **캐릭터 목록**: 모든 캐릭터의 상세 정보 확인
- **키보 목록**: 키보 캐릭터들의 정보 확인
- **상세 정보**: 각 캐릭터의 속성, 종족, 공개채널 등 확인

### 🔍 검색 & 필터링
- **텍스트 검색**: 이름이나 설명으로 검색
- **속성 필터**: 불, 물, 땅, 번개, 바람, 어둠, 빛, 얼음, 나무 속성별 필터링
- **종족 필터**: 수인, 휴먼, 하이 엘프 등 종족별 필터링
- **채널 필터**: 공개채널별 필터링

### 📊 통계
- **속성별 분포**: 파이 차트로 속성 분포 확인
- **종족별 분포**: 막대 차트로 종족 분포 확인
- **공개채널별 분포**: 도넛 차트로 채널 분포 확인
- **캐릭터 vs 키보 비율**: 전체 비율 확인

### 🎮 미니게임
- **최애 찾기**: 토너먼트 방식으로 최애 캐릭터 선택
- **플래시카드**: 캐릭터 이미지를 보고 이름 맞추기 게임
- **랭킹 시스템**: 일일 플래시카드 점수 랭킹

### 🌐 커뮤니티
- **커뮤니티 링크**: 아카라이브, 공식 홈페이지, 유튜브 링크
- **통계 정보**: 총 캐릭터 수, 키보 수, 채널 수 등

## 🚀 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Storage**: LocalStorage (랭킹 시스템)
- **Deployment**: GitHub Pages

## 📱 반응형 디자인

- 데스크톱, 태블릿, 모바일 모든 기기에서 최적화된 경험
- 터치 친화적인 인터페이스
- 적응형 레이아웃

## 🎨 UI/UX 특징

- **모던 디자인**: 그라디언트와 그림자를 활용한 현대적 디자인
- **부드러운 애니메이션**: CSS 트랜지션과 애니메이션
- **토스트 알림**: 사용자 친화적인 알림 시스템
- **로딩 상태**: 우아한 로딩 애니메이션
- **접근성**: 키보드 네비게이션 지원

## 🔧 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/jimmy1030good/page.git
cd page
```

2. 로컬 서버 실행 (선택사항)
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server
```

3. 브라우저에서 `index.html` 열기

## 📊 데이터 구조

데이터는 `data.json` 파일에 저장되며 다음 구조를 따릅니다:

```json
{
  "metadata": {
    "lastUpdated": "2025-07-24",
    "version": "1.0"
  },
  "characters": [...],
  "kibos": [...],
  "attributes": [...],
  "races": [...],
  "releaseChannels": [...]
}
```

## 🌐 배포

이 프로젝트는 GitHub Pages를 통해 자동 배포됩니다.

배포 URL: `https://jimmy1030good.github.io/page/`

## 📝 업데이트 로그

### v1.0.0 (2025-01-08)
- 초기 릴리스
- 캐릭터 및 키보 정보 뷰어
- 검색 및 필터링 기능
- 통계 차트
- 미니게임 (최애 찾기, 플래시카드)
- 커뮤니티 링크
- 반응형 디자인

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 연락처

프로젝트 링크: [https://github.com/jimmy1030good/page](https://github.com/jimmy1030good/page)

---

⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!