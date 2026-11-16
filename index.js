// const fruits = ["apple", "banana", "lichi", "apple", "lichi", "apple", "mango"];

// const duplicateCount = fruits.reduce((acc, curr) => {
//   acc[curr] = (acc[curr] || 0) + 1;
//   return acc;
// }, {});

// console.log(duplicateCount)
// const array = [2, 1, 4, 5, 3, 6, 9, 8, 7, 1, 2, 3];
// const sorted = array.sort((a, b) => b - a);
// console.log(sorted);
// const unique = sorted.filter((item, index) => sorted.indexOf(item) === index);
// console.log(unique)

// const string = "madam";

// const reversed = string.split("").reverse().join("");
// const isPalindrome = reversed === string;
// console.log("string is palindrome :", isPalindrome);

// const arr = [10, 5, 20, 8];
// const sorted = arr.sort((a, b) => b - a);
// console.log(sorted);
// console.log("second largest number is : ", sorted[1]);

// const string = "js is easy and js is powerful";
// const words = string.split(" ");
// console.log(words);
// const countFrequency = words.reduce((acc, curr) => {
//   acc[curr] = (acc[curr] || 0) + 1;
//   return acc;
// }, {});
// console.log(countFrequency);

// const string = "hello bhushan";
// const vowels = "AEIOUaeiou";
// let count = 0;
// for (let i = 0; i < string.length; i++) {
//   if (vowels.includes(string[i])) {
//     count++;
//   }
// }
// console.log("vowels count", count);

// const string = "hello bhushan";
// const consonants = "BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz";
// let count = 0;
// for (let i = 0; i < string.length; i++) {
// if (consonants.includes(string[i])) {
// count++;
// }
// }
// console.log("consonants count :", count);

// const arr = [1, 2, 4, 6, 9, 11, 14];
// const missingNumbers = [];
// for (let i = 0; i < arr.length; i++) {
//   if (arr[i] + 1 !== arr[i + 1]) {
//     let missing = arr[i] + 1;
//     while (missing < arr[i + 1]) {
//       missingNumbers.push(missing);
//       missing++;
//     }
//   }
// }
// console.log(missingNumbers);

// const array = [2, 1, 4, 5, 3, 6, 9, 8, 7, 1, 2, 3];
// const sorted = array.sort((a, b) => b - a);
// console.log(sorted);
// const unique = sorted.filter((item, index) => sorted.indexOf(item) === index);
// console.log(unique)

// const array = [10, 2, -5, 0, 6, -4];
// for (let i = 0; i < array.length; i++) {
//   if (array[i] < 0) {
//     console.log(`${array[i]} is negative number`);
//   } else if (array[i] > 0) {
//     console.log(`${array[i]} is positive number`);
//   }else{
//     console.log(`${array[i]} is zero`)
//   }
// }

// const string = "javascript";
// const words = string.split("");
// console.log(words);
// const countFrequency = words.reduce((acc, curr) => {
//   acc[curr] = (acc[curr] || 0) + 1;
//   return acc;
// }, {});

// console.log(countFrequency);
// for (const char of string) {
//   if (countFrequency[char] === 1) {
//     console.log(char);
//     break;
//   }
// }
// function isPrimeNumber(num) {
//   if (num < 2) return false;

//   for (let i = 2; i < num; i++) {
//     if (num % i === 0) return false;
//   }
//   return true;
// }

const start = 10;
const end = 20;
let primeNumbers = [];
for (let i = start; i <= end; i++) {
  if (i < 2) continue;
  let isPrime = true;
  for (let j = 2; j < i; j++) {
    if (i % j === 0) {
      isPrime = false;
      break;
    }
  }
  if (isPrime) {
    primeNumbers.push(i);
  }
}
console.log(primeNumbers);
