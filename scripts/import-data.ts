import { db } from '../src/lib/db'
import * as fs from 'fs'
import * as path from 'path'

// CSV parser that handles quoted fields
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n')
  if (lines.length === 0) return []

  const headers = parseCSVLine(lines[0])
  const results: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)
    const obj: Record<string, string> = {}
    
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || ''
    })
    
    results.push(obj)
  }

  return results
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

const cleanDescription = (desc: string) => {
  if (!desc) return null
  return desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000) || null
}

async function batchInsert(model: any, data: any[], batchSize = 100) {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    try {
      await model.createMany({ data: batch, skipDuplicates: true })
    } catch (e) {
      console.error('Batch insert error:', e)
    }
    process.stdout.write(`\rProgress: ${Math.min(i + batchSize, data.length)}/${data.length}`)
  }
  console.log('')
}

async function importData() {
  console.log('Starting data import...')
  const uploadDir = '/home/z/my-project/upload'

  // Import Drug Classes
  console.log('Importing drug classes...')
  const drugClassContent = fs.readFileSync(path.join(uploadDir, 'drug class.csv'), 'utf-8')
  const drugClasses = parseCSV(drugClassContent).map(dc => ({
    id: parseInt(dc['drug class id']),
    name: dc['drug class name'],
    slug: dc['slug'],
    genericsCount: parseInt(dc['generics count']) || 0
  }))
  await batchInsert(db.drugClass, drugClasses, 200)

  // Import Indications
  console.log('Importing indications...')
  const indicationContent = fs.readFileSync(path.join(uploadDir, 'indication.csv'), 'utf-8')
  const indications = parseCSV(indicationContent).map(ind => ({
    id: parseInt(ind['indication id']),
    name: ind['indication name'],
    slug: ind['slug'],
    genericsCount: parseInt(ind['generics count']) || 0
  }))
  await batchInsert(db.indication, indications, 200)

  // Import Dosage Forms
  console.log('Importing dosage forms...')
  const dosageFormContent = fs.readFileSync(path.join(uploadDir, 'dosage form.csv'), 'utf-8')
  const dosageForms = parseCSV(dosageFormContent).map(df => ({
    id: parseInt(df['dosage form id']),
    name: df['dosage form name'],
    slug: df['slug'],
    brandNamesCount: parseInt(df['brand names count']) || 0
  }))
  await batchInsert(db.dosageForm, dosageForms, 200)

  // Import Manufacturers
  console.log('Importing manufacturers...')
  const manufacturerContent = fs.readFileSync(path.join(uploadDir, 'manufacturer.csv'), 'utf-8')
  const manufacturers = parseCSV(manufacturerContent).map(m => ({
    id: parseInt(m['manufacturer id']),
    name: m['manufacturer name'],
    slug: m['slug'],
    genericsCount: parseInt(m['generics count']) || 0,
    brandNamesCount: parseInt(m['brand names count']) || 0
  }))
  await batchInsert(db.manufacturer, manufacturers, 200)

  // Import Generics
  console.log('Importing generics...')
  const genericContent = fs.readFileSync(path.join(uploadDir, 'generic.csv'), 'utf-8')
  const generics = parseCSV(genericContent).map(g => ({
    id: parseInt(g['generic id']),
    name: g['generic name'],
    slug: g['slug'],
    monographLink: g['monograph link'] || null,
    drugClass: g['drug class'] || null,
    indication: g['indication'] || null,
    indicationDescription: cleanDescription(g['indication description']),
    therapeuticClassDescription: cleanDescription(g['therapeutic class description']),
    pharmacologyDescription: cleanDescription(g['pharmacology description']),
    dosageDescription: cleanDescription(g['dosage description']),
    administrationDescription: cleanDescription(g['administration description']),
    interactionDescription: cleanDescription(g['interaction description']),
    contraindicationsDescription: cleanDescription(g['contraindications description']),
    sideEffectsDescription: cleanDescription(g['side effects description']),
    pregnancyLactationDescription: cleanDescription(g['pregnancy and lactation description']),
    precautionsDescription: cleanDescription(g['precautions description']),
    pediatricUsageDescription: cleanDescription(g['pediatric usage description']),
    overdoseEffectsDescription: cleanDescription(g['overdose effects description']),
    durationOfTreatmentDescription: cleanDescription(g['duration of treatment description']),
    reconstitutionDescription: cleanDescription(g['reconstitution description']),
    storageConditionsDescription: cleanDescription(g['storage conditions description']),
    descriptionsCount: parseInt(g['descriptions count']) || 0
  }))
  await batchInsert(db.generic, generics, 100)

  // Import Medicines
  console.log('Importing medicines...')
  const medicineContent = fs.readFileSync(path.join(uploadDir, 'medicine.csv'), 'utf-8')
  const medicines = parseCSV(medicineContent).map(m => ({
    id: parseInt(m['brand id']),
    brandName: m['brand name'],
    type: m['type'],
    slug: m['slug'],
    dosageForm: m['dosage form'],
    generic: m['generic'],
    strength: m['strength'],
    manufacturer: m['manufacturer'],
    packageContainer: m['package container'] || null,
    packageSize: m['Package Size'] || null,
    genericId: null
  }))
  await batchInsert(db.medicine, medicines, 500)

  console.log('Data import completed!')
}

importData().catch(console.error)
