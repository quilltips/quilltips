
-- Remove duplicate page views (keep earliest), only where visitor_id is set
DELETE FROM page_views a
USING page_views b
WHERE a.id > b.id
  AND a.visitor_id IS NOT NULL
  AND a.visitor_id = b.visitor_id
  AND a.author_id = b.author_id
  AND a.page_type = b.page_type
  AND COALESCE(a.qr_code_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(b.qr_code_id, '00000000-0000-0000-0000-000000000000'::uuid);

-- Create unique partial index to prevent future duplicates
CREATE UNIQUE INDEX idx_unique_page_view_per_visitor
ON page_views (visitor_id, author_id, page_type, COALESCE(qr_code_id, '00000000-0000-0000-0000-000000000000'::uuid))
WHERE visitor_id IS NOT NULL;
