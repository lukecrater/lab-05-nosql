// bookstore.js - Lab 05, Case Study 1
// Rebuilds the bookstore database from authors.json and books.json,
// adds two new books and their missing authors, then runs the queries.
// Run from the repository's top-level directory so the JSON files are found:
//   mongosh "$MONGODB_ATLAS_URL" --apiVersion 1 --username "$MONGODB_ATLAS_USER" --file bookstore.js

// Step 2: switch to the bookstore database
// use bookstore   (shell-only shortcut; not valid inside a script)
db = db.getSiblingDB("bookstore")

// Step 3: load authors.json
// Drop first so rerunning the script does not insert duplicate authors
db.authors.drop()
doc = JSON.parse(fs.readFileSync("authors.json", "utf8"))
db.authors.insertMany(doc)

// Step 4: load books.json
db.books.drop()
doc = JSON.parse(fs.readFileSync("books.json", "utf8"))
db.books.insertMany(doc)

// Step 5: list every author and every book
// (printjson is needed because find() does not auto-print inside a script)
print("\n--- Step 5: all authors ---")
printjson(db.authors.find().toArray())
print("\n--- Step 5: all books ---")
printjson(db.books.find().toArray())

// Step 6: insert two new books
// Both books are by authors not in the loaded data (author_004, author_005)
db.books.insertMany([
  {
    title: "Invisible Man",
    published_year: 1952,
    author_ids: ["author_004"]
  },
  {
    title: "The River of Doubt",
    published_year: 2005,
    author_ids: ["author_005"]
  }
])

// Step 7: add the missing authors of the new books
// MongoDB does not enforce references, so each _id must match the book's author_ids
db.authors.insertMany([
  {
    _id: "author_004",
    name: "Ralph Ellison",
    nationality: "American",
    bio: {
      short: "American novelist and critic best known for Invisible Man.",
      long: "Ralph Ellison was an American novelist, literary critic, and scholar. His only novel published in his lifetime, Invisible Man, follows an unnamed Black narrator searching for identity in mid-20th-century America and won the National Book Award in 1953."
    }
  },
  {
    _id: "author_005",
    name: "Candice Millard",
    nationality: "American",
    bio: {
      short: "American writer of narrative history.",
      long: "Candice Millard is an American writer and former National Geographic writer and editor. Her first book, The River of Doubt, recounts Theodore Roosevelt's dangerous 1914 expedition down an uncharted tributary of the Amazon; she later wrote Destiny of the Republic and Hero of the Empire."
    }
  }
])

// Step 8: filter books by a list of authors
// Includes one loaded author (author_001) and both new authors (author_004, author_005).
// $in matches a book if ANY value in its author_ids array is in this list.
print("\n--- Step 8: books by author_001, author_004, author_005 ---")
printjson(db.books.find({ author_ids: { $in: ["author_001", "author_004", "author_005"] } }).toArray())
