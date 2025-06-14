
import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#11182A',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export function parseQRCode(qrData: string): { type: string; id: string } | null {
  try {
    // Handle web URLs (new format)
    if (qrData.includes('/material/')) {
      const materialId = qrData.split('/material/')[1];
      if (materialId) {
        return { type: 'material', id: materialId };
      }
    }
    
    // Expected format: "material:uuid" or "passport:uuid"
    if (qrData.includes(':')) {
      const [type, id] = qrData.split(':')
      if (type && id) {
        return { type, id }
      }
    }
    
    // Handle legacy QR codes or simple format
    if (qrData.startsWith('QR')) {
      return { type: 'legacy', id: qrData }
    }
    
    return null
  } catch {
    return null
  }
}

// Generate QR data for materials - now creates web links
export function createMaterialQRData(materialId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/material/${materialId}`;
}

// Generate QR data for material passports
export function createPassportQRData(passportId: string): string {
  return `passport:${passportId}`
}

// Generate a simple QR code identifier
export function generateSimpleQRCode(materialId: string): string {
  return `QR${materialId.slice(-6).toUpperCase()}`;
}
