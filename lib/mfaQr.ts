/** Render a QR code SVG from an otpauth URI using the qrcode package. */
export async function otpauthQrSvg(otpauthUri: string): Promise<string> {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toString(otpauthUri, {
    type: 'svg',
    margin: 1,
    errorCorrectionLevel: 'M',
    width: 192,
  });
}
