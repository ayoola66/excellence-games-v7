#!/bin/bash

# Get the current timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

# Create backup directory if it doesn't exist
BACKUP_DIR="$HOME/targeted-backups"
mkdir -p "$BACKUP_DIR"

# Create a timestamped backup
BACKUP_NAME="targeted-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Create backup info file
echo "Backup created at: $(date)" > backup-info.txt
echo "Project: Targeted Games" >> backup-info.txt
echo "Version: $(node -p "require('./package.json').version")" >> backup-info.txt
echo "Branch: $(git branch --show-current)" >> backup-info.txt
echo "Last commit: $(git log -1 --pretty=format:"%h - %s")" >> backup-info.txt

# Create the backup
mkdir -p "$BACKUP_PATH"
rsync -av --exclude 'node_modules' \
         --exclude '.next' \
         --exclude '.git' \
         --exclude 'backup-*' \
         --exclude '.DS_Store' \
         --exclude 'dist' \
         --exclude 'build' \
         --exclude '.env*' \
         ./ "$BACKUP_PATH/"

# Move backup info file into the backup
mv backup-info.txt "$BACKUP_PATH/"

# Create a compressed archive
cd "$BACKUP_DIR"
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"

# Remove the uncompressed backup
rm -rf "$BACKUP_PATH"

echo "✅ Backup created successfully at: $BACKUP_DIR/$BACKUP_NAME.tar.gz" 