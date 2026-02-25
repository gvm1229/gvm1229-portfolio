#!/bin/bash

# 1. 환경 설정
PARENT_DIR="../FoliumOnline"
CHILD_DIR="."

# 자식 저장소의 최신 커밋 정보 저장
CHILD_COMMIT_HASH=$(git rev-parse HEAD)
echo "🚀 [워크플로우 시작] 현재 커밋($CHILD_COMMIT_HASH)을 부모로 전파합니다."

# --- STEP 0: 자식 저장소 혹시 모를 변경사항 저장 ---
git stash
echo "📦 0. 자식 저장소의 변경사항을 임시 저장(Stash)합니다."

# --- STEP 1: 부모 저장소 로컬 최신화 ---
echo "📡 1. 부모 저장소(FoliumOnline) 상태 점검 및 최신화..."
cd "$PARENT_DIR" || exit
git fetch origin           # 원격의 모든 브랜치 정보를 가져옴
git switch main
git pull origin main      # 로컬 main 최신화
git switch develop
git pull origin develop   # 로컬 develop 최신화

# --- STEP 2: Parent Develop으로 체리픽 및 푸시 ---
echo "📂 2. 부모 저장소 develop에 자식의 변경사항 반영..."
git fetch "$OLDPWD" develop
# cherry-pick 시에도 commitlint가 작동하므로, 자식의 커밋 메시지도 규칙을 지켜야 합니다.
git cherry-pick "$CHILD_COMMIT_HASH"
# 푸시해서 부모 저장소의 develop 브랜치에 반영
git push origin develop

# --- STEP 3: Parent Develop -> Parent Main 병합 ---
echo "🔄 3. 부모 저장소: develop -> main 병합 중..."
git switch main

# commitlint 규칙(feat:)을 준수하는 메시지 구성
# "feat: [Merge] 구조적 업데이트 반영" 형식을 사용합니다.
MERGE_MSG="merge: [Merge from FoliumTea/develop] 업데이트 반영"
git merge develop --no-ff -m "$MERGE_MSG"
# 푸시해서 부모 저장소의 main 브랜치에 반영
git push origin main

# --- STEP 4: Child Main 업데이트 ---
echo "📂 4. 자식 저장소(Portfolio) 이동 및 main 업데이트..."
cd "../gvm1229-portfolio" || exit
git switch main
git pull upstream main

# --- STEP 5: Child Develop 리베이스 (Author Date 유지) ---
echo "🛠 5. 자식 저장소: develop을 main 기반으로 리베이스 중..."
git switch develop
git rebase main --committer-date-is-author-date

if [ $? -eq 0 ]; then
    echo "✨ [완료] 모든 워크플로우가 성공적으로 끝났습니다."
    echo "현재 위치: child/develop (Conventional Commit 규칙 준수 완료)"

    # 자식 저장소 기존 작업물 복구
    git stash pop
    echo "📦 [완료] 자식 저장소의 변경사항을 복구(Stash Pop)합니다."
else
    echo "❌ [오류] 리베이스 중 충돌이 발생했습니다. 수동 해결이 필요합니다."
fi