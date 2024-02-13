function konversiStringKeHeksadesimal(string) {
    var str = string.replace(/[A-C]/g, function(match) {
        // Mengubah karakter "A", "B", atau "C" menjadi "0", "1", atau "2"
        return String.fromCharCode(match.charCodeAt(0) - 65 + 10);
    });

    // Konversi string ke bentuk heksadesimal
    var hex = BigInt('0x' + str); // Menggunakan BigInt
    // Mengonversi kembali ke heksadesimal dengan panjang tepat 20 karakter (80 bit)
    var paddedHex = hex.toString(16).padStart(20, '0');
    return paddedHex;
}

function shiftLeft(key, shiftBits) {
    let leftPart = key & ((1n << 19n) - 1n); // Menggunakan BigInt
    let rightPart = key >> 19n; // Menggunakan BigInt
    let shiftedKey = ((leftPart << BigInt(shiftBits)) & ((1n << 80n) - 1n)) + rightPart; // Menggunakan BigInt
    return shiftedKey;
}

function SBOX(value) {
    let Sbox = [0xcn, 0x5n, 0x6n, 0xbn, 0x9n, 0x0n, 0xan, 0xdn, 0x3n, 0xen, 0xfn, 0x8n, 0x4n, 0x7n, 0x1n, 0x2n];
    return (Sbox[value >> 4n] << 4n) + (value & 0xfn); // Menggunakan BigInt
}

function generateRoundKey(inputKeyHex, rounds) {
    let roundKeys = [];
    let key = BigInt('0x' + inputKeyHex);
    for (let i = 1n; i <= BigInt(rounds+1); i++) { // Ubah ke BigInt
        roundKeys.push(key.toString(16).padStart(20, '0'));

        // 1. Shift Left
        key = shiftLeft(key, 61);

        // 2. SBox
        key = (SBOX(key >> 76n) << 76n) + (key & ((1n << 76n) - 1n)); // Menggunakan BigInt

        // 3. Dapatkan posisi bit ke-19 hingga ke-15 dan lakukan XOR dengan 5 bit dari ronde ke-i
        let bit19to15 = (key >> 15n) & 0b11111n; // Dapatkan 5 bit terakhir
        let roundKeyFiveBits = i & 0b11111n; // Ubah ke BigInt
        let xorResult = bit19to15 ^ roundKeyFiveBits; // Lakukan XOR
        key = (key & ~((0b11111n << 15n))) | (xorResult << 15n); // XOR hasilnya dengan 5 bit pertama kunci putaran ke-i
    }
    return roundKeys;
}


// const inputHex = konversiStringKeHeksadesimal("00000000000000000000"); // 80 bit awal ini yg CONTOHIN YOUTUBE
const inputHex = konversiStringKeHeksadesimal("4654544b554d52414837"); // 80 bit awal ini yg FTTKUMRAH7
const MasterRoundKeys = generateRoundKey(inputHex, 32); // Contoh: 10 putaran
const roundKeys = MasterRoundKeys.map((item, idx) => item.slice(4)); // Menghapus 4 karakter pertama

for (let i = 0; i < roundKeys.length; i++){
    console.log("RoundKey-", i, " >> ", roundKeys[i])
}

module.exports = {roundKeys,konversiStringKeHeksadesimal}
