const {roundKeys, konversiStringKeHeksadesimal} = require("./expansiKey")

// S-box
const Sbox = [0xc, 0x5, 0x6, 0xb, 0x9, 0x0, 0xa, 0xd, 0x3, 0xe, 0xf, 0x8, 0x4, 0x7, 0x1, 0x2];
// S-box invers
const Sbox_inv = [];
for (let i = 0; i < 16; i++) {
    Sbox_inv[Sbox[i]] = i;
}

// P-box
const PBox = [
    0, 16, 32, 48, 1, 17, 33, 49,
    2, 18, 34, 50, 3, 19, 35, 51,
    4, 20, 36, 52, 5, 21, 37, 53,
    6, 22, 38, 54, 7, 23, 39, 55,
    8, 24, 40, 56, 9, 25, 41, 57,
    10, 26, 42, 58, 11, 27, 43, 59,
    12, 28, 44, 60, 13, 29, 45, 61,
    14, 30, 46, 62, 15, 31, 47, 63
];
// P-box invers
const PBox_inv = [];
for (let i = 0; i < 64; i++) {
    PBox_inv[PBox[i]] = i;
}

function addRoundKey(stateHex, roundKeyHex) {
    // Mengonversi state dan roundKey ke dalam BigInt
    let state = BigInt('0x' + stateHex);
    let roundKey = BigInt('0x' + roundKeyHex);

    // Melakukan XOR antara state dan roundKey
    let result = state ^ roundKey;

    // Mengonversi hasil XOR ke dalam string heksadesimal
    let resultHex = result.toString(16);

    // Memastikan panjang string tetap 16 karakter dengan padding leading zero jika diperlukan
    if (resultHex.length > 16) {
        resultHex = resultHex.substring(resultHex.length - 16);
    } else {
        resultHex = resultHex.padStart(16, '0');
    }

    // Mengembalikan hasil
    return resultHex;
}

// Fungsi S-box untuk enkripsi
function sBoxLayer(state) {
    let output = BigInt(0); // Menginisialisasi output sebagai BigInt
    for (let i = 0; i < 16; i++) {
        let sboxIndex = Number((state >> (BigInt(i) * BigInt(4))) & BigInt(0xF)); // Konversi BigInt ke bilangan biasa
        output += BigInt(Sbox[sboxIndex]) << (BigInt(i) * BigInt(4)); // Operasi bitwise menggunakan BigInt
    }
    return output.toString(16).padStart(16, '0'); // Mengembalikan sebagai string heksadesimal
}

// Fungsi P-box untuk enkripsi
function pLayer(state) {
    let output = BigInt(0); // Menginisialisasi output sebagai BigInt
    for (let i = 0; i < 64; i++) {
        output += ((state >> BigInt(i)) & BigInt(0x01)) << BigInt(PBox[i]); // Operasi bitwise menggunakan BigInt
    }
    return output.toString(16).padStart(16, '0'); // Mengembalikan sebagai string heksadesimal
}


function encryption(plainteks, rounds){
    let cipherteks = plainteks
    for(let i = 0; i < rounds; i++){
        // addRoundKey plainteks heksadesimal dengan roundkeys ke i heksadesimal
        // Dapatkan kunci putaran ke-i dari roundKeys
        let roundKeyHex = roundKeys[i];

        // Lakukan operasi XOR antara cipherteks dan kunci putaran
        cipherteks = addRoundKey(cipherteks, roundKeyHex);

        // SBOX LAYER
         cipherteks = sBoxLayer(BigInt('0x' + cipherteks)).toString(16).padStart(16, '0');

         // PLayer
        cipherteks = pLayer(BigInt('0x' + cipherteks)).toString(16).padStart(16, '0');
    }
    // Lakukan operasi XOR antara cipherteks dan kunci putaran
    cipherteks = addRoundKey(cipherteks, roundKeys[rounds]);
    return cipherteks
}

// const inputHex = konversiStringKeHeksadesimal("0000000000000000") // 64 bit atau 8 karakter atau 16 heksa
const inputHex = konversiStringKeHeksadesimal("49544b4552454e37") // 64 bit atau 8 karakter atau 16 heksa (ITKEREN7)
const cipherteks = encryption(inputHex, 32)
console.log("\ncipherteks >>> ", cipherteks)

