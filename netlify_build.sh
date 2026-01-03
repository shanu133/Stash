#!/usr/bin/env bash
set -e

echo "Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

export PATH="$HOME/.cargo/bin:$PATH"
rustup default stable

echo "Rust installed:"
rustc --version
cargo --version

echo "Python version:"
python --version

echo "Installing Python packages..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Build finished"
