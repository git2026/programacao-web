use sha2::{Sha512, Digest};

const ITERATIONS: u32 = 10000;
const MAX_OUTPUT_SIZE: usize = 256;

static mut OUTPUT_BUFFER: [u8; MAX_OUTPUT_SIZE] = [0; MAX_OUTPUT_SIZE];

#[no_mangle]
pub unsafe extern "C" fn hash_password(
    password_ptr: *const u8,
    password_len: usize,
    salt_ptr: *const u8,
    salt_len: usize,
) -> usize {
    let password = std::slice::from_raw_parts(password_ptr, password_len);
    let salt = std::slice::from_raw_parts(salt_ptr, salt_len);
    
    let mut combined = Vec::with_capacity(password.len() + salt.len());
    combined.extend_from_slice(password);
    combined.extend_from_slice(salt);
    
    let mut hash = Sha512::digest(&combined);
    for _ in 1..ITERATIONS {
        let mut hasher = Sha512::new();
        hasher.update(&hash);
        hasher.update(salt);
        hash = hasher.finalize();
    }
    
    let hex_string = hex::encode(&hash);
    let hex_bytes = hex_string.as_bytes();
    
    if hex_bytes.len() <= MAX_OUTPUT_SIZE {
        OUTPUT_BUFFER[..hex_bytes.len()].copy_from_slice(hex_bytes);
        hex_bytes.len()
    } else {
        0
    }
}

#[no_mangle]
#[allow(static_mut_refs)]
pub extern "C" fn get_output_buffer() -> *const u8 {
    unsafe { OUTPUT_BUFFER.as_ptr() }
}

#[no_mangle]
pub unsafe extern "C" fn verify_password(
    password_ptr: *const u8,
    password_len: usize,
    hash_ptr: *const u8,
    hash_len: usize,
    salt_ptr: *const u8,
    salt_len: usize,
) -> i32 {
    let password = std::slice::from_raw_parts(password_ptr, password_len);
    let expected_hash = std::slice::from_raw_parts(hash_ptr, hash_len);
    let salt = std::slice::from_raw_parts(salt_ptr, salt_len);
    
    let mut combined = Vec::with_capacity(password.len() + salt.len());
    combined.extend_from_slice(password);
    combined.extend_from_slice(salt);
    
    let mut hash = Sha512::digest(&combined);
    for _ in 1..ITERATIONS {
        let mut hasher = Sha512::new();
        hasher.update(&hash);
        hasher.update(salt);
        hash = hasher.finalize();
    }
    
    let computed_hash_hex = hex::encode(&hash);
    let expected_hash_str = match std::str::from_utf8(expected_hash) {
        Ok(s) => s,
        Err(_) => return 0,
    };
    
    if computed_hash_hex == expected_hash_str {
        1
    } else {
        0
    }
}

