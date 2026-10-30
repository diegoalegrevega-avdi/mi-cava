import type { LabelDraft } from './labelScanner'

export async function mockScan(_file: File): Promise<LabelDraft> {
  void _file
  await new Promise((resolve) => setTimeout(resolve, 400))
  return {
    name: 'Rioja Reserva',
    winery: 'Bodegas Muga',
    vintage: 2016,
    region: 'Rioja',
    country: 'España',
    varietals: ['Tempranillo', 'Graciano'],
    type: 'tinto',
  }
}
