# Implementation & Review Principles for All Contributors

## 0. Scope
본 원칙은 **비즈니스 로직 구현, 인프라(IaC) 작성, 테스트, 코드 품질 개선, 리팩토링** 전반에 적용한다.  
대상: 개발자, 리뷰어, 자동화 도구, AI 에이전트 포함.

---

## 1. Role & Output Format
**당신의 역할**: 본 원칙을 준수하는 시니어 개발자이자 코드 리뷰어.  
**출력 형식** _(AI/코딩 툴 사용 시)_:
1. 코드 (Production-ready)
2. 테스트 코드 (단위/통합)
3. 변경·설계 의도 요약 (3줄 이내)

---

## 2. Priority Rules
- 규칙 충돌 시 **테스트 용이성 > 단순성 > 확장성** 순으로 우선한다.
- 성능 최적화는 **기능 구현 + 테스트 통과 이후** 고려한다.

---

## 3. Implementation Principles

### Test-First Development
1. 실패하는 테스트 작성 → 최소 구현으로 통과 → 리팩토링 순서 준수.
2. 외부 IO(네트워크/DB/파일)는 포트·어댑터·인터페이스로 격리.
3. 도메인 로직 테스트는 순수하게 유지.

### SOLID
- SRP: 단일 책임, 불분명하면 분리.
- OCP: 수정 없이 확장 가능하게(추상·다형성).
- LSP: 하위 타입은 상위 타입 계약 준수.
- ISP: 작은 인터페이스 분리, 불필요 의존 금지.
- DIP: 고수준 정책은 추상에 의존, 구체는 조립단계에서 주입.

### Clean Architecture
- 계층: 엔티티/도메인 → 유스케이스 → 인터페이스 어댑터 → 프레임워크.
- 의존성은 **도메인 방향(안쪽)** 으로만.
- DTO는 경계에서 정의·매핑 명확히.
- 도메인은 순수 함수·불변성 우선.

---

## 4. IaC Guidelines
- Pulumi/CloudFormation Description은 **목적, 소비자, 환경/리전, 보안 요약, 변경 시 주의사항** 포함.
- **네이밍 규칙**: `{env}-{service}-{resourceType}` (예: prod-billing-sqs)
- 최소 권한·암호화·네트워크 경계 설정 기본.
- 파라미터·시크릿은 안전 저장소 사용, 코드 하드코딩 금지.
- 수동 변경 금지, 모든 변경은 코드·리뷰·파이프라인 경유.

---

## 5. Code Quality

### Simplicity First
- 가장 단순한 충분한 솔루션 우선.
- 불필요한 추상화·옵션·매개변수 배제 (YAGNI).

### DRY & SSOT
- 중복 제거, 공통 모듈 추출.
- 도메인 규칙은 한 곳에서만 진리 관리.

### Naming & Readability
- 명확·일관된 네이밍.
- 토큰/출력 비용 최소화하되 가독성 유지.

### Observability
- 경계(입출력, 실패 지점)에 구조화된 로깅·메트릭·트레이싱.
- 민감정보 마스킹 필수.

---

## 6. Refactoring

### Principles
- 목적: 구조 개선(기능 변경 금지).
- 큰 변경 전: 계획·승인 필수(범위, 리스크, 테스트, 롤백).
- 작은 단계로, 각 단계 테스트 통과.
- 설계 냄새(긴 함수, 중복, 순환 의존, 부적절 추상화) 제거.
- 유스케이스/도메인과 어댑터 의존 역전 위반 해소.

### Completion Criteria
- 모든 테스트(단위/통합/회귀) 통과.
- 빌드·파이프라인 녹색, 린트·정적 분석 경고 기준 이내.
- 문서·다이어그램 최신화.

---

## 7. Testing Standards

### Layers
- Domain: 순수 규칙, 빠른 단위 테스트.
- Use Case: DTO 경계·시나리오 검증(성공/실패/예외/타임아웃).
- Adapter/Gateway: 계약 테스트로 외부 호환성 보장.
- E2E: 핵심 사용자 흐름 최소 세트.

### Coverage & Quality
- 중요 경로 분기 커버리지 충족(합의 기준).
- Flaky 테스트 금지 → 원인 분석 후 재작성.
- Mock/Stubs: 외부 IO는 Stub 우선, 복잡 시나리오만 Mock 사용.

### Naming
- Given-When-Then 또는 Arrange-Act-Assert 패턴.
- 테스트명은 행위+기대 결과 서술형.

---

## 8. Branch · Review · Release

### Branch Strategy
- feature/, fix/, refactor/ 접두사로 구분.

### PR Principles
- 작은 단위 제출, 테스트·설계 의도 요약.
- 리팩토링 PR은 "기능 불변" 명시.

### Release Gate
- 모든 검사 통과 후 배포.
- 변경 로그·마이그레이션 노트 작성.

---

## 9. Exception Handling
- 긴급 패치: 책임자 승인 후 최소 변경.
- 48시간 내 테스트·문서·설계 반영.

---

## 10. Pre/Post Implementation Checklist

**Before**
- 사용자/도메인 시나리오 정의
- 실패 테스트 작성
- 경계/의존성 설계(SOLID/Clean Architecture)

**During**
- 최소 구현으로 테스트 통과
- 중복 제거·단순화
- 로깅/메트릭 삽입(민감정보 마스킹)

**After**
- 리팩토링 계획·승인(필요 시)
- 모든 테스트/파이프라인 통과
- IaC Description 영문 검수
- 문서·다이어그램 업데이트

---

## 11. Example Templates

**IaC Description 예시**
```
"Provision an internal SQS queue for async order processing. Used by service 'billing-api'. Deployed in prod only."
"Creates a private RDS instance for the orders service with automated backups and encryption at rest. Accessible only within the VPC."
"Defines an S3 bucket for audit logs with lifecycle rules and object lock (compliance mode)."
```

**Test 명명 예시**
```
should_return_error_when_order_id_is_invalid
should_calculate_discount_for_vip_customers
```
