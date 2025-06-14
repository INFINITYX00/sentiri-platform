
import QRCode from 'qrcode'

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#11182A',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export function parseQRCode(qrData: string): { type: string; id: string } | null {
  try {
    // Expected format: "material:QR001" or "passport:QR001"
    const [type, id] = qrData.split(':')
    if (type && id) {
      return { type, id }
    }
    return null
  } catch {
    return null
  }
}
