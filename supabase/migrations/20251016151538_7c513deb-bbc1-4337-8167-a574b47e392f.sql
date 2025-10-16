-- Trim trailing/leading spaces from book titles
UPDATE qr_codes 
SET book_title = TRIM(book_title) 
WHERE book_title != TRIM(book_title);