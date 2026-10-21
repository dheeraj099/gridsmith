const NAMES = [
  'Alice Johnson','Bob Smith','Carol White','David Brown','Emma Davis',
  'Frank Miller','Grace Wilson','Henry Moore','Isabella Taylor','Jack Anderson',
  'Karen Thomas','Liam Jackson','Maya Harris','Nathan Martin','Olivia Thompson',
  'Peter Garcia','Quinn Martinez','Rachel Robinson','Samuel Clark','Tiffany Lewis',
  'Ulric Lee','Victoria Walker','William Hall','Xena Allen','Yusuf Young',
  'Zara King','Aaron Wright','Bella Scott','Carlos Green','Diana Adams',
]

const DEPARTMENTS = ['Engineering','Product','Design','Marketing','Sales','Finance','Legal','HR','Operations','DevRel']

const ROLES: Record<string, string[]> = {
  Engineering: ['Frontend Engineer','Backend Engineer','Staff Engineer','Engineering Manager','SRE','Data Engineer'],
  Product: ['Product Manager','Senior PM','VP of Product','Product Analyst'],
  Design: ['UX Designer','Product Designer','Design Lead','Brand Designer'],
  Marketing: ['Marketing Manager','Content Strategist','SEO Specialist','Growth Engineer'],
  Sales: ['Account Executive','Sales Engineer','Sales Manager','BDR'],
  Finance: ['Financial Analyst','Controller','VP Finance','Accountant'],
  Legal: ['Counsel','Senior Counsel','Paralegal','Legal Ops'],
  HR: ['HR Business Partner','Recruiter','People Ops','HR Director'],
  Operations: ['Operations Manager','Analyst','Program Manager','COO'],
  DevRel: ['Developer Advocate','Technical Writer','Community Manager'],
}

const COUNTRIES = ['USA','UK','Germany','Canada','India','Australia','France','Netherlands','Singapore','Brazil','Japan','Spain']

const STATUSES: Array<'Active' | 'On Leave' | 'Remote'> = ['Active','Active','Active','Remote','Remote','On Leave']

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0x100000000
  }
}

export function generateRows(count: number) {
  const rand = seededRandom(42)
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)]

  return Array.from({ length: count }, (_, i) => {
    const dept = pick(DEPARTMENTS)
    const roles = ROLES[dept] ?? ['Specialist']
    const year = 2016 + Math.floor(rand() * 9)
    const month = String(1 + Math.floor(rand() * 12)).padStart(2, '0')
    const day = String(1 + Math.floor(rand() * 28)).padStart(2, '0')

    return {
      id: i + 1,
      name: pick(NAMES),
      department: dept,
      role: pick(roles),
      salary: 60000 + Math.floor(rand() * 140000),
      country: pick(COUNTRIES),
      status: pick(STATUSES) as 'Active' | 'On Leave' | 'Remote',
      startDate: `${year}-${month}-${day}`,
      projects: 1 + Math.floor(rand() * 14),
    }
  })
}
