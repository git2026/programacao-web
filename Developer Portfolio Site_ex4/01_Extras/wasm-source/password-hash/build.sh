#!/bin/bash

set -e

if ! command -v cargo &> /dev/null; then
    echo "Erro: Rust/Cargo nao esta instalado"
    echo "Instale em: https://rustup.rs/"
    exit 1
fi

if ! rustup target list --installed | grep -q "wasm32-wasip1"; then
    rustup target add wasm32-wasip1
fi

cargo build --target wasm32-wasip1 --release

mkdir -p ../../backend/wasm/build
cp target/wasm32-wasip1/release/password_hash.wasm ../../backend/wasm/build/password_hash.wasm

