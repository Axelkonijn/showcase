import Image from 'next/image';
import SkillBadge from '@/components/SkillBadge';

export default function ProfilePage() {
  const skills = ['C#', 'ASP.NET Core', 'TypeScript', 'Next.js', 'SQL', 'Docker', 'Tekenen'];

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-50 p-8 md:p-16">
      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: Visuals*/}
        <section className="md:col-span-1 flex flex-col gap-6">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-lg">
            <Image
              src="/person-pasfoto.png"
              alt="Pasfoto van placeholder"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-lg">
              <Image
                src="/dog.png"
                alt="Pasfoto van placeholder"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-lg">
              <Image
                src="/capibara.png"
                alt="Pasfoto van placeholder"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                priority
              />
            </div>
            <p className="text-sm italic text-zinc-500">
              Professionele vaardigheden in actie.
            </p>
          </div>
        </section>

        {/* Right Column: Content*/}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Name Section (Requirement: Naam van de student-webdeveloper) */}
          <header>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Axel Konijnenburg
            </h1>
            <p className="mt-2 text-xl text-zinc-600 dark:text-zinc-400">
              Student Web Developer
            </p>
          </header>

          {/* Introduction Section*/}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Over Mij
            </h2>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              Gedreven software developer met een sterke focus op het C#- en .NET-ecosysteem. Ik ontwerp en bouw onderhoudbare, schaalbare applicaties en hecht waarde aan heldere architectuur, weloverwogen technische keuzes en code die ook over een jaar nog te begrijpen is. Mijn werkwijze kenmerkt zich door incrementele ontwikkeling, kritisch zelfonderzoek en een voortdurende drang om de redenering achter elke beslissing te doorgronden — niet alleen het "hoe", maar vooral het "waarom". 
              <br></br><br></br>Naast mijn technische werk teken ik graag. Het resultaat ziet u links naast deze tekst: bewijs dat precisie en oog voor detail zich niet tot code beperken.
            </p>
          </section>

          {/* Skills Section*/}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
              Technische Skills
            </h2>
            <div className="flex flex-wrap">
              {skills.map((skill) => (
                <SkillBadge key={skill} name={skill} />
              ))}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}