const express = require('express');
const { fakerEN, fakerAR, fakerRU, fakerDE, fakerFR, faker, Faker} = require('@faker-js/faker');
const cors = require('cors');
const app = express();
app.use(cors());

let users = [];
const numUsersPerPage = 20;
function roundWithProbability(value) {
    const random = Math.random();
    if (random < 0.5) {
        return Math.floor(value);
    } else {
        return Math.ceil(value);
    }
}
function introduceErrors(userData, errorProbability) {
    errorProbability = roundWithProbability(errorProbability)
        if(errorProbability===0){
            return userData
        }
        else{
            for (let i = 0; i < errorProbability; i++) {
                const randomErrorType = Math.floor(Math.random() * 3);
                const randomIndex = Math.floor(Math.random() * userData.length);

                userData.map(user=>{
                    let key = Object.keys(user)
                    let n = Math.floor(Math.random() * 3) + 2
                    console.log(key,n)
                    let randomKey = key[n];
                    let randomValue= user[randomKey]
                    console.log('random:',randomKey, randomValue)
                    switch (randomErrorType) {
                        case 0:
                            user[randomKey] = deleteUserCharacter(user[randomKey]);
                            break;
                        case 1:
                            user[randomKey] = addUserCharacter(user[randomKey],user.code);
                            break;
                        case 2:
                            user[randomKey] = swapAdjacentCharacters(user[randomKey]);
                            break;
                        default:
                            break;
                    }
                })

            }
        }
}
function deleteUserCharacter(user) {
    console.log('lolo:',user)
    const indexToDelete = Math.floor(Math.random() * user.length);
    user = user.substring(0, indexToDelete) + user.substring(indexToDelete + 1);
    return user;
}

function addUserCharacter(user, region) {
    const indexToAdd = Math.floor(Math.random() * user.length);
    console.log(`code:`,region)
    let characters;
    switch (region) {
        case '+7':
            characters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789';
            break;
        case '+33':
            characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            break;
        default:
            characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            break;
    }

    // Генерация случайного символа из выбранного набора
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomCharacter = characters[randomIndex];

    // Вставка сгенерированного символа в строку пользователя
    user = user.substring(0, indexToAdd) + randomCharacter + user.substring(indexToAdd);
    return user;
}

function swapAdjacentCharacters(user) {
    console.log('lolo:',user)
    const indexToSwap = Math.floor(Math.random() * (user.length - 1));
    user = user.substring(0, indexToSwap) + user.charAt(indexToSwap + 1) + user.charAt(indexToSwap) + user.substring(indexToSwap + 2);
    return user;
}
function generateUserData(seed, page, fakerLang,numUsersPerPage) {
    faker.seed(seed + page);
    let code = '+1'
    let userData = []
    switch (fakerLang){
        case 'fakerRU':
            fakerRU.seed(seed + page)
            code = '+7'
             userData = Array.from({ length: numUsersPerPage }, () => new User(fakerRU,code)
             );
            break;
        case 'fakerUK':
            fakerAR.seed(seed+page)
            code = '+33'
             userData = Array.from({ length: numUsersPerPage }, () => new User(fakerFR,code));
            break;
        case 'fakerDE':
            fakerAR.seed(seed+page)
            userData = Array.from({ length: numUsersPerPage }, () => new User(fakerDE,code));
            break;
        default:
            userData = Array.from({ length: numUsersPerPage }, () => new User(fakerEN,code));
            break
    }
    return userData;
}

class User {
    constructor(fakerLang,code) {
        this.id = fakerLang.string.uuid();
        this.code = code
        this.name = fakerLang.person.fullName();
        this.address = fakerLang.location.city() + ', ' + fakerLang.location.streetAddress()
        this.phone_number = this.code + `(${fakerLang.phone.imei().split('-').join('').slice(0,3)})` + fakerLang.phone.imei().split('-').join('').slice(3,10);
    }
}

app.put('/users', (req, res) => {
    const seed = req.query.seed;
    const page = req.query.page;
    const fakerLang = req.query.loc
    const probability = req.query.probability;
    const numUsersPerPage = req.query.count
    console.log(+numUsersPerPage?numUsersPerPage:20)
    const userData = generateUserData(+seed, +page, fakerLang, +numUsersPerPage?numUsersPerPage:20);
    introduceErrors(userData, +probability);
    users = userData;
    res.status(201).json(users);
});

app.get('/users', (req, res) => {
    res.json(users);
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
