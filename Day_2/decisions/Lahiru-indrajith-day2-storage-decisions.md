# BookSwap — Storage and Cache Decisions

## 1. Data inventory
| Data type | Example record | Volume estimate (1y) | Read/write ratio |
|-----------|----------------|----------------------|------------------|
| Book listing | one row per book | ~50,000 across all buildings | read-heavy |
| Book Photo | five photos per book | ~250,000 across all buildings | read-heavy |
| Owner details | one row per owner | ~2000 across all buildings | read-heavy |
| Borrower details | one row per borrower | <2000 across all buildings | write-heavy |
| Loan details | one row per each loaned book | <10000 across all buildings | write-heavy |


## 2. Storage selection
| Data type | Chosen store | Why this store | Why not the alternatives |
|-----------|--------------|----------------|--------------------------|
| Book listing | Azure SQL | Relational with FK to member | Document DB unnecessary, relational joins useful |
| Book photo | Azure Blob Storage | Binary, big | Database BLOBs would bloat backups |
| Owner details | Azure SQL | Relational with FK to books | Documents will create duplicate records per book. relational joins fitting for the situation |
| Borrower Details | Azure SQL | Relational with FK to Books | Documents will create duplicate details for each book and borrower | 
| Loan Details | Azure SQL | Relational with FK to books, borrower |  relational joins useful |


## 3. Cache plan
- What is hot enough to cache?
Search catalogue will the higest requested data from the database and since the catalog rarely changes reading it through the database gonna cose time and CPU power everytime by caching the search catalogue the TTL and database read ratio also can be reduced and load balancing for database requests also managed. Individual book details are the same since users will often check the book details

- Cache-aside pattern in pseudocode
fucntion listBooks(page, pageSize,condition):

//cache key
key = buildKey("books:List",page, pageSize,condition)

//cache reading first
cached = redis.get(key)

if cached is not null:
    return deserialise(cached) 

//if not stored in the cache hit the db
result = db.query(
    SELECT * FROM books
    WHERE ($condition IS NULL OR condition = $condition)
    ORDER BY listed_at DESC
    LIMIT $pageSize OFFSET ($page - 1) * $pageSize
)

//populate the cache after returning
redis.set(key, searialize(result), ttl = 100)
return result


- TTL choice and invalidation strategy
//Invalidation strategy for Keys
//When owners list a new book

function createBook(input):
    book = db.insert("books", input)

// When a new book is created the catalogue needs to update so all the paginated keys are invalidated
// Delete the pages that are stale

redis.deleteByPattern("books:list:*")

return book

# TTL choices 
books:list:*
TTL = 2 min 
Reason = Catalogue updates when books are listed or returned. 2 min staleness is cannot be noticed by the casual user browsing since if a new listing happend a 2 min lag before the new listing appears is fine

books:details:{id}
TTL = 5 min
Reason = The details of the book never changes and only the status is invalidated explicitly on borrow. On Occationally the owners can be changed with trading

user:loancount:{id}
TTL = 45s
Reason = This is will enforce a real limit so Over-borrowing isn't possible

borrow request status
TTL = <2s
Reason = the borrower is watching this is real time. When the TTL is long this may lead to cofusion as a borrower


## 4. Queue plan
- Which work goes on a queue and why
For BookSwap when a borrower request is approved by the owner few things needs to happen as a side effect like sending email confirmation to borrower, updating book status to borrowed. These are needed to be done after the HTTP response return 200 OK. Doing then synchronously mean the user need to wait for all of them to happen and if one of them fails the API call fails with 500 if the emailing service is down or notification service is slow.

Work like sending notification and emails, updating denormalised counts, triggering reminder jobs before due dates, invalidation caches across multiple keys atomically

- What happens if the consumer is down for 30 minutes
If we are using queues for notification and email services, every single borrow approval is succeeds without an error but the job is stored in the queue and when the consumer comes back up to processes the backlog in order. The borrower gets their notification and email 30 min late instead of not all, and sometimes borrower might not even notice it if there is no queue in place for these systems when the request is processed and the systems are down the API returns with a 500 error for server issue.
