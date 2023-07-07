use colored::*;
use regex::Regex;
use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(name = "solts", about = "An tools for solana ecosystem to used")]
struct Opt {
    /// privde private key bytes for convert to hex string
    #[structopt(name = "raw-private", short = "p", long = "private", parse(from_str = from_string))]
    private_key_bytes: [u8; 64],
}

fn main() {
    let opt = Opt::from_args();
    println!("{:?}", opt);

    let hex_string: String = opt
        .private_key_bytes
        .iter()
        .map(|b| format!("{:02x}", b))
        .collect();
    let temp = "🏅️Convert Successful! your private key".green();
    println!("{}: {}", temp, hex_string.red());
}

pub fn from_string(private_key: &str) -> [u8; 64] {
    let re = Regex::new(r"\d+").expect("never fails");
    let mut private_key_bytes = [0u8; 64];
    for (i, match_) in re.find_iter(private_key).enumerate() {
        let num: u8 = match_.as_str().parse().expect("Error parsing number");
        private_key_bytes[i] = num;
    }
    private_key_bytes
}

#[test]
fn test_from_string() {
    let temp = "[\n        167, 22, 56, 211, 117, 126, 206, 224, 17, 116, 48, 241, 237, 180, 239, 28, 232, 96, 36,\n        156, 114, 114, 3, 69, 226, 25, 255, 75, 197, 9, 153, 221, 60, 231, 158, 41, 76, 228, 178,\n        212, 90, 70, 183, 31, 5, 233, 143, 107, 108, 57, 122, 200, 159, 224, 108, 3, 251, 21, 233,\n        42, 10, 57, 28, 241,\n    ]";
    let bytes = from_string(temp);
    println!("{:?}", bytes);
}
