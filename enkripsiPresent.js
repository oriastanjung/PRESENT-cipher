const { roundKeys, konversiStringKeHeksadesimal } = require("./expansiKey");
console.log("\n\nPROSES ENKRIPSI\n")
// S-box
const Sbox = [
  0xc, 0x5, 0x6, 0xb, 0x9, 0x0, 0xa, 0xd, 0x3, 0xe, 0xf, 0x8, 0x4, 0x7, 0x1,
  0x2,
];
// S-box invers
const Sbox_inv = [];
for (let i = 0; i < 16; i++) {
  Sbox_inv[Sbox[i]] = i;
}

// P-box
const PBox = [
  0, 16, 32, 48, 1, 17, 33, 49, 2, 18, 34, 50, 3, 19, 35, 51, 4, 20, 36, 52, 5,
  21, 37, 53, 6, 22, 38, 54, 7, 23, 39, 55, 8, 24, 40, 56, 9, 25, 41, 57, 10,
  26, 42, 58, 11, 27, 43, 59, 12, 28, 44, 60, 13, 29, 45, 61, 14, 30, 46, 62,
  15, 31, 47, 63,
];
// P-box invers
const PBox_inv = [];
for (let i = 0; i < 64; i++) {
  PBox_inv[PBox[i]] = i;
}

function addRoundKey(stateHex, roundKeyHex) {
  // Mengonversi state dan roundKey ke dalam BigInt
  let state = BigInt("0x" + stateHex);
  let roundKey = BigInt("0x" + roundKeyHex);

  // Melakukan XOR antara state dan roundKey
  let result = state ^ roundKey;

  // Mengonversi hasil XOR ke dalam string heksadesimal
  let resultHex = result.toString(16);

  // Memastikan panjang string tetap 16 karakter dengan padding leading zero jika diperlukan
  if (resultHex.length > 16) {
    resultHex = resultHex.substring(resultHex.length - 16);
  } else {
    resultHex = resultHex.padStart(16, "0");
  }

  // Mengembalikan hasil
  return resultHex;
}

// Fungsi S-box untuk enkripsi
function sBoxLayer(state) {
  let output = BigInt(0); // Menginisialisasi output sebagai BigInt
  for (let i = 0; i < 16; i++) {
    let sboxIndex = Number((state >> (BigInt(i) * BigInt(4))) & BigInt(0xf)); // Konversi BigInt ke bilangan biasa
    output += BigInt(Sbox[sboxIndex]) << (BigInt(i) * BigInt(4)); // Operasi bitwise menggunakan BigInt
  }
  return output.toString(16).padStart(16, "0"); // Mengembalikan sebagai string heksadesimal
}

// Fungsi P-box untuk enkripsi
function pLayer(state) {
  let output = BigInt(0); // Menginisialisasi output sebagai BigInt
  for (let i = 0; i < 64; i++) {
    output += ((state >> BigInt(i)) & BigInt(0x01)) << BigInt(PBox[i]); // Operasi bitwise menggunakan BigInt
  }
  return output.toString(16).padStart(16, "0"); // Mengembalikan sebagai string heksadesimal
}

function encryption(plainteks, rounds) {
  let cipherteks = plainteks;
  for (let i = 0; i < rounds; i++) {
    let roundKeyHex = roundKeys[i];
    cipherteks = addRoundKey(cipherteks, roundKeyHex);
    console.log("Ronde ke ", i, " >> Setelah addRoundKey: ", cipherteks);

    cipherteks = sBoxLayer(BigInt("0x" + cipherteks))
      .toString(16)
      .padStart(16, "0");
    console.log("Ronde ke ", i, " >> Setelah S-box: ", cipherteks);

    cipherteks = pLayer(BigInt("0x" + cipherteks))
      .toString(16)
      .padStart(16, "0");
    console.log("Ronde ke ", i, " >> Setelah P-layer: ", cipherteks);
  }
  cipherteks = addRoundKey(cipherteks, roundKeys[rounds]);
  console.log(
    "Ronde ke ",
    rounds,
    " >> Setelah addRoundKey terakhir: ",
    cipherteks
  );

  return cipherteks;
}

// const inputHex = konversiStringKeHeksadesimal("0000000000000000") // 64 bit atau 8 karakter atau 16 heksa
const inputHex = konversiStringKeHeksadesimal("49544b4552454e37"); // 64 bit atau 8 karakter atau 16 heksa (ITKEREN7)
const cipherteks = encryption(inputHex, 32);
console.log("\ncipherteks >>> ", cipherteks);
console.log("\n\nPROSES DEKRIPSI\n")
///////////////////////////////////////////////////////////////////////////////////////////

// Fungsi inverse S-box
function inverseSBoxLayer(state) {
  let output = BigInt(0);
  for (let i = 0; i < 16; i++) {
    let sboxIndex = Number((state >> (BigInt(i) * BigInt(4))) & BigInt(0xf));
    output += BigInt(Sbox_inv[sboxIndex]) << (BigInt(i) * BigInt(4));
  }
  return output.toString(16).padStart(16, "0");
}

// Fungsi inverse P-box
function inversePLayer(state) {
  let output = BigInt(0);
  for (let i = 0; i < 64; i++) {
    output += ((state >> BigInt(i)) & BigInt(0x01)) << BigInt(PBox_inv[i]);
  }
  return output.toString(16).padStart(16, "0");
}
function decryption(cipherteks, rounds) {
  let plainteks = cipherteks;

  for (let i = rounds; i >= 1; i--) {
    let roundKeyHex = roundKeys[i];
    plainteks = addRoundKey(plainteks, roundKeyHex);
    console.log("Ronde ke ", i, " >> Setelah addRoundKey: ", plainteks);

    plainteks = inversePLayer(BigInt("0x" + plainteks))
      .toString(16)
      .padStart(16, "0");
    console.log("Ronde ke ", i, " >> Setelah inversi P-layer: ", plainteks);

    plainteks = inverseSBoxLayer(BigInt("0x" + plainteks))
      .toString(16)
      .padStart(16, "0");
    console.log("Ronde ke ", i, " >> Setelah inversi S-box: ", plainteks);
  }
  plainteks = addRoundKey(plainteks, roundKeys[0]);
  console.log("Ronde ke ", 0, " >> Setelah addRoundKey terakhir: ", plainteks);

  return plainteks;
}
// Dekripsi cipherteks yang telah dienkripsi sebelumnya
const plainteks = decryption(cipherteks, 32);
console.log("\nplainteks (HEKSA) asli>>> ", inputHex);
console.log("\nplainteks (HEKSA) sesudah dekripsi>>> ", plainteks);
