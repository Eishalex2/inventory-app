#! /usr/bin/env node

console.log(
  'This script populates some test categories and items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Category = require("./models/category");
const Item = require("./models/item");

const categories = [];
const items = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createItems();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name) {
  const category = new Category({ name: name });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, description, category, price, number_in_stock) {
  const itemdetail = { name: name, description: description, category: category, price: price, number_in_stock: number_in_stock };

  const item = new Item(itemdetail);

  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log("Adding categories");
  await Promise.all([
    categoryCreate(0, "Fire"),
    categoryCreate(1, "Ice"),
    categoryCreate(2, "Imaginary"),
  ]);
}

async function createItems() {
  console.log("Adding items");
  await Promise.all([
    itemCreate(0,
      "Topaz and Numby",
      "Senior Manager of the Strategic Investment Department in the IPC, and her pet, the Warp Trotter 'Numby'.",
      categories[0],
      70,
      39974
    ),
    itemCreate(1,
      "Gepard",
      "Captain of the Silvermane Guards.",
      categories[1],
      4,
      392
    ),
    itemCreate(2,
      "Dang Heng - IL",
      "Former Vidyadhara High Elder of The Xianzhou Luofu. Cooler Dan Heng.",
      categories[2],
      70,
      131182
    ),
    itemCreate(3,
      "Guinaifen",
      "An outworlder who ended up on the Xianzhou. Passionate video streamer.",
      categories[0],
      13,
      451628
    ),
    itemCreate(4,
      "Jingliu",
      "Former sword master of the Xianzhou Luofu, as well as Jing Yuan's mentor. She escaped after going insane due to Mara.",
      categories[1],
      70,
      125527
    ),
    itemCreate(5,
      "Luocha",
      "Mysterious merchant. He appeared on the Xianzhou Luofu one day with a huge coffin (contents still unknown).",
      categories[2],
      68,
      141675
    ),
  ]);
}