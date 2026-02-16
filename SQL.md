# SQL Interview Questions & Answers  
**Target Role: Full-Stack & Backend Engineer**

---

# 🟢 BASIC SQL (20 Questions + Answers)

## 1. What is SQL?
SQL (Structured Query Language) is used to define, manipulate, and control relational databases.

Main categories:
- **DDL** – CREATE, ALTER, DROP
- **DML** – INSERT, UPDATE, DELETE
- **DQL** – SELECT
- **TCL** – COMMIT, ROLLBACK
- **DCL** – GRANT, REVOKE

---

## 2. Difference between WHERE and HAVING?

- `WHERE` filters rows before grouping.
- `HAVING` filters after `GROUP BY`.

```sql
SELECT department, COUNT(*)
FROM employees
WHERE salary > 50000
GROUP BY department
HAVING COUNT(*) > 5;
```

---

## 3. What is a Primary Key?

* Uniquely identifies each row.
* Cannot be NULL.
* Automatically indexed.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255)
);
```

---

## 4. What is a Foreign Key?

Maintains referential integrity between tables.

```sql
FOREIGN KEY (user_id) REFERENCES users(id);
```

---

## 5. PRIMARY KEY vs UNIQUE


| Feature      | Primary Key | UNIQUE      |
| ------------ | ----------- | ----------- |
| NULL allowed | ❌ No        | ✅ Usually 1 |
| Per table    | Only 1      | Multiple    |
| Indexed      | Yes         | Yes         |

---

## 6 DELETE vs TRUNCATE vs DROP

| Command  | Deletes Rows | Structure | Rollback     | Speed  |
| -------- | ------------ | --------- | ------------ | ------ |
| DELETE   | Yes          | Keeps     | Yes          | Slower |
| TRUNCATE | All          | Keeps     | No (usually) | Fast   |
| DROP     | Entire table | Deletes   | No           | Fast   |


---

## 7 What is an Index?

A data structure (usually B-Tree) that improves lookup speed.

Trade-off:

* Faster reads
* Slower writes

---

## 8. What is GROUP BY?

Groups rows to apply aggregate functions.

```sql
SELECT department, AVG(salary)
FROM employees
GROUP BY department;
```

---

## 9. COUNT(*) vs COUNT(column)

COUNT(*) counts all rows.

COUNT(column) ignores NULL values.

---

## 10. What is a JOIN?

Combines rows from multiple tables.

```sql
SELECT u.name, o.amount
FROM users u
JOIN orders o ON u.id = o.user_id;
```

---

## 11. INNER JOIN vs LEFT JOIN

* INNER → Only matching rows
* LEFT → All left rows + matches

---

## 12. What is a Self Join?

A table joined with itself.

```sql
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m
ON e.manager_id = m.id;
```

---

## 13. What is a Subquery?

Query inside another query.

```sql
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders);
```

---

## 14. IN vs EXISTS

* IN → Good for small datasets
* EXISTS → Better for large datasets

---

## 15. Aggregate Functions

* COUNT
* SUM
* AVG
* MIN
* MAX

---

## 16. What is Normalization?

Reducing redundancy in database design.

---

## 17. Normal Forms

* 1NF → Atomic values
* 2NF → No partial dependency
* 3NF → No transitive dependency

---

## 18. Default ORDER BY?

Ascending (ASC)

---

## 19. What is NOT NULL?

Prevents storing NULL values.

---

## 20. What is Referential Integrity?

Ensures foreign key values exist in referenced table.

---

# 🟡 INTERMEDIATE SQL (20 Questions + Answers)

## 1. Clustered vs Non-Clustered Index

* Clustered → Defines physical row order (1 per table)
* Non-clustered → Separate structure pointing to rows

---

## 2. Composite Index

Index on multiple columns.

```sql
CREATE INDEX idx_user_name
ON users(first_name, last_name);
```

Column order matters.

