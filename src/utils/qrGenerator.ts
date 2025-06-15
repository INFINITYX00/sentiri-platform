
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
    // Handle web URLs for materials (existing)
    if (qrData.includes('/material/')) {
      const materialId = qrData.split('/material/')[1];
      if (materialId) {
        return { type: 'material', id: materialId };
      }
    }
    
    // Handle web URLs for product passports (new)
    if (qrData.includes('/product/')) {
      const productId = qrData.split('/product/')[1];
      if (productId) {
        return { type: 'product', id: productId };
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

// Generate QR data for materials - creates web links
export function createMaterialQRData(materialId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/material/${materialId}`;
}

// Generate QR data for product passports - creates web links
export function createProductPassportQRData(passportId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${passportId}`;
}

// Generate QR data for material passports (legacy)
export function createPassportQRData(passportId: string): string {
  return `passport:${passportId}`
}

// Generate a simple QR code identifier
export function generateSimpleQRCode(materialId: string): string {
  return `QR${materialId.slice(-6).toUpperCase()}`;
}

// Generate complete QR package for material
export async function generateCompleteQRPackage(materialId: string): Promise<{
  qrData: string;
  qrCodeDataURL: string;
  simpleCode: string;
}> {
  console.log('Generating complete QR package for material:', materialId);
  
  const qrData = createMaterialQRData(materialId);
  const simpleCode = generateSimpleQRCode(materialId);
  
  console.log('QR data:', qrData);
  console.log('Simple code:', simpleCode);
  
  const qrCodeDataURL = await generateQRCode(qrData);
  
  console.log('QR code generated successfully');
  
  return {
    qrData,
    qrCodeDataURL,
    simpleCode
  };
}

// Generate complete QR package for product passport
export async function generateProductPassportQRPackage(passportId: string): Promise<{
  qrData: string;
  qrCodeDataURL: string;
  simpleCode: string;
}> {
  console.log('Generating complete QR package for product passport:', passportId);
  
  const qrData = createProductPassportQRData(passportId);
  const simpleCode = generateSimpleQRCode(passportId);
  
  console.log('Product QR data:', qrData);
  console.log('Simple code:', simpleCode);
  
  const qrCodeDataURL = await generateQRCode(qrData);
  
  console.log('Product QR code generated successfully');
  
  return {
    qrData,
    qrCodeDataURL,
    simpleCode
  };
}
