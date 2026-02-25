#!/bin/bash

# 1. 환경 설정
PARENT_DIR="../FoliumOnline"
CHILD_DIR="."

# gvm1229-portfolio 저장소의 최신 commit 정보 저장
CHILD_COMMIT_HASH=$(git rev-parse HEAD)
echo "🚀 [워크플로우 시작] 현재 commit($CHILD_COMMIT_HASH)을 FoliumOnline로 전파합니다."

# --- STEP 1: FoliumOnline 저장소 로컬 최신화 ---
echo "📡 1. FoliumOnline 저장소(FoliumOnline) 상태 점검 및 최신화..."
cd "$PARENT_DIR" || exit
git fetch origin          # FoliumOnline 원격의 모든 브랜치 정보를 가져옴
git switch main
git pull origin main      # FoliumOnline 로컬 main 최신화
git switch develop
git pull origin develop   # FoliumOnline 로컬 develop 최신화

# --- STEP 2: Parent Develop으로 cherry-pick 및 푸시 ---
echo "📂 2. FoliumOnline 저장소 develop에 gvm1229-portfolio의 변경사항 반영 중중..."
git fetch "$OLDPWD" develop
git cherry-pick "$CHILD_COMMIT_HASH"
git push origin develop

# --- STEP 3: Parent Develop -> Parent Main 병합 ---
echo "🔄 3. FoliumOnline 저장소: develop -> main 병합 중..."
git switch main
MERGE_MSG="merge: [Merge from FoliumTea/develop] 업데이트 반영"
git merge develop --no-ff -m "$MERGE_MSG"
git push origin main

# --- STEP 4: Child Main 업데이트 ---
echo "📂 4. gvm1229-portfolio 저장소 이동 및 main 업데이트..."
cd "../gvm1229-portfolio" || exit
git switch main
git pull upstream main

# --- STEP 5: Child Develop rebase (에러 핸들링 강화) ---
echo "🛠 5. gvm1229-portfolio 저장소: develop을 main 기반으로 rebase 중..."
git switch develop

# rebase 시도 전 작업 내역(Unstaged Changes)이 있는지 확인
if [[ -n $(git status --porcelain | grep -E "^(M| M|A| A|D| D)") ]]; then
    echo "❌ [중단] rebase를 할 수 없습니다: gvm1229-portfolio 저장소에 commit 되거나 stash 되지 않은 변경사항이 있습니다."
    echo "작업 내용을 commit 하거나 'git stash'를 실행한 후 다시 시도해 주세요."
    exit 1
fi

# rebase 실행
git rebase main --committer-date-is-author-date

REBASE_RESULT=$?

if [ $REBASE_RESULT -eq 0 ]; then
    echo "✨ [완료] 모든 워크플로우가 성공적으로 끝났습니다."
    echo "현재 위치: gvm1229-portfolio/develop (구조 동기화 및 기록 정렬 완료)"
else
    echo "❌ [오류] rebase 중 충돌이 발생했습니다."
    echo "수동으로 충돌을 해결한 후 'git rebase --continue'를 입력하거나, 'git rebase --abort'로 취소하세요."
    exit 1
fi