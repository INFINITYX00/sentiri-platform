
-- Add a new column to store QR code image URL separately from QR data
ALTER TABLE materials ADD COLUMN qr_image_url TEXT;
