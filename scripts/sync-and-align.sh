#!/bin/bash

# 1. 환경 설정
PARENT_DIR="../FoliumOnline"
CHILD_DIR="."

# 인자 처리 로직 (단일 해시 및 since 범위 지원)
if [ "$1" == "since" ] && [ -n "$2" ]; then
    CHILD_COMMIT_HASH=$(git rev-list --reverse $2^..HEAD)
    echo "🎯 [범위 커밋 사용] $2 부터 현재까지의 모든 commit을 FoliumOnline로 전파합니다."
elif [ -n "$1" ]; then
    CHILD_COMMIT_HASH=$1
    echo "🎯 [입력된 커밋 사용] 지정된 해시($CHILD_COMMIT_HASH)를 FoliumOnline로 전파합니다."
else
    CHILD_COMMIT_HASH=$(git rev-parse HEAD)
    echo "🚀 [워크플로우 시작] 현재 commit($CHILD_COMMIT_HASH)을 FoliumOnline로 전파합니다."
fi

# --- STEP 1: FoliumOnline 저장소 로컬 최신화 ---
echo "📡 1. FoliumOnline 저장소(FoliumOnline) 상태 점검 및 최신화..."
cd "$PARENT_DIR" || exit
git fetch origin
git switch develop
git pull origin develop

# --- STEP 2: Parent Develop으로 cherry-pick 및 푸시 (날짜 보존) ---
echo "📂 2. FoliumOnline 저장소 develop에 변경사항 반영 및 푸시..."
git fetch "$OLDPWD" develop

# GitHub 타임라인을 유지하기 위해 Author Date를 Committer Date에 강제 적용
for rev in $CHILD_COMMIT_HASH; do
    # 해당 커밋의 원래 Author Date를 추출
    AUTH_DATE=$(git log -1 --format=%ai $rev)
    
    # GIT_COMMITTER_DATE를 Author Date와 일치시켜 GitHub 히스토리 꼬임 방지
    GIT_COMMITTER_DATE="$AUTH_DATE" git cherry-pick $rev
done

# 부모 저장소의 원격 develop 브랜치에 반영
git push origin develop

echo "✨ [완료] 부모 저장소(FoliumOnline/develop)로의 전파가 끝났습니다."
echo "⚠️ 이후 과정(Main 병합 및 자식 동기화)은 수동으로 진행해 주세요."