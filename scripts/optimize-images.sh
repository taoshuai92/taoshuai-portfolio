#!/bin/bash
# 批量把 PNG/JPG 转成 WebP (质量 82，保留透明通道，肉眼无差别)
# 同时重新压缩偏大的已有 WebP
set -e

cd "$(dirname "$0")/.."

echo "=== 开始图片优化 ==="
TOTAL_SAVED=0
COUNT=0

# 1. 转换所有 PNG/JPG/JPEG
find assets -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read -r f; do
  webp="${f%.*}.webp"
  before=$(stat -f%z "$f" 2>/dev/null || echo 0)
  # cwebp: -q 质量, -m 压缩方法(6=最佳), -alpha_q alpha质量
  cwebp -q 82 -m 6 -alpha_q 90 "$f" -o "$webp" 2>/dev/null
  after=$(stat -f%z "$webp" 2>/dev/null || echo 0)
  if [ "$after" -gt 0 ]; then
    saved=$((before - after))
    echo "✓ $(basename "$f") : $((before/1024))KB → $((after/1024))KB (省 $((saved/1024))KB)"
    rm "$f"
  else
    echo "✗ 转换失败: $f"
  fi
done

# 2. 重新压缩偏大的已有 WebP (>400KB)
echo ""
echo "=== 重新压缩偏大的 WebP ==="
find assets -type f -name "*.webp" | while read -r f; do
  size=$(stat -f%z "$f" 2>/dev/null || echo 0)
  if [ "$size" -gt 409600 ]; then
    before=$size
    cwebp -q 80 -m 6 -alpha_q 85 "$f" -o "${f}.tmp.webp" 2>/dev/null
    after=$(stat -f%z "${f}.tmp.webp" 2>/dev/null || echo 0)
    if [ "$after" -gt 0 ] && [ "$after" -lt "$before" ]; then
      mv "${f}.tmp.webp" "$f"
      saved=$((before - after))
      echo "✓ $(basename "$f") : $((before/1024))KB → $((after/1024))KB (省 $((saved/1024))KB)"
    else
      rm -f "${f}.tmp.webp"
    fi
  fi
done

echo ""
echo "=== 优化完成 ==="
