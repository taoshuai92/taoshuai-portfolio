#!/bin/bash
# 把无损/偏大的动画 WebP 重新压成有损（保留逐帧 offset/duration/dispose/blend）
# 流程: webpmux -get frame 拆帧 → cwebp 有损压缩每帧 → webpmux -frame 精确重组
# 用法: bash scripts/compress-animated-webp.sh <file1.webp> [file2.webp] ...
set -e
QUALITY=${QUALITY:-65}
ALPHA_Q=${ALPHA_Q:-80}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

for INPUT in "$@"; do
  [ -f "$INPUT" ] || { echo "✗ 跳过(不存在): $INPUT"; continue; }
  before=$(stat -f%z "$INPUT")
  info=$(webpmux -info "$INPUT" 2>&1)
  frames=$(printf '%s\n' "$info" | grep -cE '^[[:space:]]*[0-9]+:')
  [ "$frames" -eq 0 ] && { echo "✗ 无法解析: $INPUT"; continue; }

  # 静态图: 直接有损压缩
  if [ "$frames" -le 1 ]; then
    cwebp -q "$QUALITY" -m 6 -alpha_q "$ALPHA_Q" "$INPUT" -o "$TMP/s.webp" 2>/dev/null || true
    after=$(stat -f%z "$TMP/s.webp" 2>/dev/null || echo 0)
    if [ "$after" -gt 0 ] && [ "$after" -lt "$before" ]; then
      mv "$TMP/s.webp" "$INPUT"
      echo "✓ $(basename "$INPUT") [静态]: $((before/1024))→$((after/1024))KB"
    else
      echo "  $(basename "$INPUT") [静态]: 无收益，保留原文件"
    fi
    continue
  fi

  echo "▶ $(basename "$INPUT"): $frames 帧, 原 $((before/1024))KB"

  # 第1遍: 提取+压缩每帧
  printf '%s\n' "$info" | grep -E '^[[:space:]]*[0-9]+:' | while IFS= read -r line; do
    n=$(printf "%03d" "$(echo "$line" | awk '{print $1}' | tr -d ':')")
    webpmux -get frame "$(echo "$line" | awk '{print $1}' | tr -d ':')" "$INPUT" -o "$TMP/f_$n.webp" 2>/dev/null || true
    cwebp -q "$QUALITY" -m 4 -alpha_q "$ALPHA_Q" "$TMP/f_$n.webp" -o "$TMP/f_$n.l.webp" 2>/dev/null || true
  done

  # 第2遍: 解析参数构造 webpmux -frame 命令(写入参数文件)
  argfile="$TMP/args.txt"
  : > "$argfile"
  printf '%s\n' "$info" | grep -E '^[[:space:]]*[0-9]+:' | while IFS= read -r line; do
    n=$(printf "%03d" "$(echo "$line" | awk '{print $1}' | tr -d ':')")
    set -- $line
    dur=$7; xo=$5; yo=$6; disp=$8; blend=$9
    [ "$disp" = "none" ] && dc=0 || dc=1
    [ "$blend" = "no" ] && bc="-b" || bc="+b"
    printf -- "-frame\n%s\n+%s+%s+%s+%s%s\n" "$TMP/f_$n.l.webp" "$dur" "$xo" "$yo" "$dc" "$bc" >> "$argfile"
  done
  printf -- "-loop\n0\n-o\n%s\n" "$TMP/out.webp" >> "$argfile"

  webpmux "$argfile" 2>&1 | tail -1 || true
  after=$(stat -f%z "$TMP/out.webp" 2>/dev/null || echo 0)
  if [ "$after" -gt 0 ] && [ "$after" -lt "$before" ]; then
    mv "$TMP/out.webp" "$INPUT"
    echo "  ✓ 完成: $((before/1024))→$((after/1024))KB"
  else
    echo "  ✗ 压缩失败，保留原文件"
  fi
done
echo "=== 完成 ==="
