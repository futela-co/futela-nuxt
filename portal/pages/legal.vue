<script setup lang="ts">
import { BuildingOfficeIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  public: true,
})

useHead({
  title: 'Mentions legales',
})

const sections = [
  { id: 'editeur', label: 'Editeur du site' },
  { id: 'directeur', label: 'Directeur de publication' },
  { id: 'hebergement', label: 'Hebergement' },
  { id: 'propriete', label: 'Propriete intellectuelle' },
  { id: 'donnees', label: 'Donnees personnelles' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'responsabilite', label: 'Responsabilite' },
  { id: 'liens', label: 'Liens hypertextes' },
  { id: 'droit', label: 'Droit applicable' },
  { id: 'credits', label: 'Credits' },
  { id: 'contact', label: 'Contact' },
]

const activeSection = ref('')

function scrollTo(id: string, event?: Event) {
  event?.preventDefault()
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }
}

onMounted(() => {
  const hash = useRoute().hash
  if (hash) {
    nextTick(() => {
      const target = document.getElementById(hash.slice(1))
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
  )
  sections.forEach(s => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-10">
    <!-- Header compact -->
    <div class="flex items-center gap-3 mb-8">
      <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-50">
        <BuildingOfficeIcon class="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Mentions legales</h1>
        <p class="text-xs text-slate-400 mt-0.5">Derniere mise a jour : 1er mars 2026</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
      <!-- Content -->
      <div class="lg:col-span-3 space-y-10 text-sm text-slate-700 leading-relaxed [&_section]:scroll-mt-24 [&_h3]:scroll-mt-24">
        <section :id="sections[0].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[0].id" @click="scrollTo(sections[0].id, $event)">1. Editeur du site <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Le site internet Futela, accessible a l'adresse futela.com, est edite par :</p>
          <div class="mt-3 p-4 bg-slate-50 rounded-lg space-y-1">
            <p><strong>Denomination sociale</strong> : Futela</p>
            <p><strong>Forme juridique</strong> : Societe a Responsabilite Limitee (SARL)</p>
            <p><strong>Activite</strong> : Plateforme de location et reservation immobiliere en ligne</p>
            <p><strong>Siege social</strong> : Kinshasa, Republique Democratique du Congo</p>
            <p><strong>Email</strong> : contact@futela.com</p>
            <p><strong>Telephone</strong> : +243 XXX XXX XXX</p>
          </div>
          <p class="mt-3">La societe Futela est enregistree conformement a la legislation en vigueur en Republique Democratique du Congo et exerce ses activites dans le respect des lois et reglementations applicables au commerce electronique et aux services numeriques.</p>
        </section>

        <section :id="sections[1].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[1].id" @click="scrollTo(sections[1].id, $event)">2. Directeur de la publication <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Le directeur de la publication du site futela.com est le representant legal de la societe Futela. En cette qualite, il est responsable du contenu editorial publie par Futela sur la plateforme.</p>
          <p class="mt-3">Le directeur de la publication veille au respect de la legislation en matiere de presse et de communication en ligne. Toute reclamation relative au contenu editorial peut etre adressee a l'adresse email suivante : contact@futela.com.</p>
          <p class="mt-3">Les contenus publies par les utilisateurs (annonces, avis, messages) relevent de la seule responsabilite de leurs auteurs respectifs.</p>
        </section>

        <section :id="sections[2].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[2].id" @click="scrollTo(sections[2].id, $event)">3. Hebergement <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Le site internet Futela est heberge par des prestataires professionnels garantissant un haut niveau de disponibilite, de securite et de performance. Les services d'hebergement comprennent :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li><strong>Hebergement web</strong> : serveurs securises avec infrastructure redondante, assurant une disponibilite optimale de la plateforme.</li>
            <li><strong>Base de donnees</strong> : systemes de gestion de bases de donnees performants et securises, avec sauvegardes regulieres automatisees.</li>
            <li><strong>Stockage de fichiers</strong> : infrastructure de stockage cloud pour les medias (photos d'annonces, documents) avec chiffrement au repos.</li>
            <li><strong>Reseau de distribution de contenu (CDN)</strong> : acceleration de la livraison des contenus statiques pour une experience utilisateur optimale.</li>
          </ul>
          <p class="mt-3">Nos prestataires d'hebergement sont selectionnes selon des criteres stricts de securite, de fiabilite et de conformite aux standards internationaux de protection des donnees. Ils s'engagent contractuellement a maintenir un niveau de securite eleve et a respecter la confidentialite des donnees hebergees.</p>
        </section>

        <section :id="sections[3].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[3].id" @click="scrollTo(sections[3].id, $event)">4. Propriete intellectuelle <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="contenus-futela" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#contenus-futela" @click="scrollTo('contenus-futela', $event)">4.1 Contenus de Futela <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>L'ensemble des elements constituant le site Futela est protege par les dispositions relatives a la propriete intellectuelle et au droit d'auteur. Cela inclut notamment :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>La structure generale, l'architecture et le design du site.</li>
            <li>Les textes, graphismes, images, photographies et illustrations produits par Futela.</li>
            <li>Les logos, marques, denominations sociales et signes distinctifs.</li>
            <li>Les logiciels, codes sources, algorithmes et bases de donnees.</li>
            <li>Les noms de domaine associes a la plateforme.</li>
          </ul>
          <p class="mt-2">Toute reproduction, representation, modification, publication, transmission, denaturation, totale ou partielle du site ou de son contenu, par quelque procede que ce soit, et sur quelque support que ce soit, est interdite sans l'autorisation ecrite prealable de Futela.</p>

          <h3 id="contenus-utilisateurs" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#contenus-utilisateurs" @click="scrollTo('contenus-utilisateurs', $event)">4.2 Contenus des utilisateurs <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Les utilisateurs conservent l'integralite de leurs droits de propriete intellectuelle sur les contenus qu'ils publient via la plateforme (textes, photos, descriptions d'annonces). En publiant du contenu, l'utilisateur accorde a Futela une licence non exclusive, gratuite, mondiale et pour la duree legale de protection des droits d'auteur, aux fins d'afficher, reproduire et distribuer ce contenu dans le cadre du fonctionnement normal de la plateforme.</p>

          <h3 id="marques" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#marques" @click="scrollTo('marques', $event)">4.3 Marques <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Les marques « Futela » et le logo associe sont des marques deposees. Toute utilisation, reproduction ou representation de ces marques sans autorisation prealable constitue une contrefacon passible de poursuites.</p>
        </section>

        <section :id="sections[4].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[4].id" @click="scrollTo(sections[4].id, $event)">5. Donnees personnelles <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>La collecte et le traitement de vos donnees personnelles sont effectues conformement a notre <NuxtLink to="/privacy" class="text-primary-600 hover:underline">Politique de confidentialite</NuxtLink>, qui detaille :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li>Les types de donnees collectees et les finalites du traitement.</li>
            <li>Les bases legales du traitement de vos donnees.</li>
            <li>Les destinataires de vos donnees et les conditions de partage.</li>
            <li>Les mesures de securite mises en oeuvre pour proteger vos donnees.</li>
            <li>Vos droits en matiere de protection des donnees (acces, rectification, suppression, portabilite, opposition).</li>
            <li>La duree de conservation de vos donnees.</li>
            <li>Les modalites d'exercice de vos droits.</li>
          </ul>
          <p class="mt-3">Pour toute question relative a vos donnees personnelles, vous pouvez nous contacter a contact@futela.com ou consulter notre politique de confidentialite.</p>
        </section>

        <section :id="sections[5].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[5].id" @click="scrollTo(sections[5].id, $event)">6. Cookies <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Le site Futela utilise des cookies et des technologies similaires pour assurer son bon fonctionnement et ameliorer l'experience de navigation des utilisateurs.</p>

          <h3 id="types-cookies-legal" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#types-cookies-legal" @click="scrollTo('types-cookies-legal', $event)">6.1 Types de cookies utilises <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Cookies strictement necessaires</strong> : ils sont indispensables a la navigation sur le site et permettent d'utiliser ses fonctionnalites essentielles (authentification, securite, preferences de session).</li>
            <li><strong>Cookies analytiques</strong> : ils nous permettent de mesurer l'audience du site, de comprendre comment les utilisateurs naviguent et d'ameliorer nos services en consequence.</li>
            <li><strong>Cookies fonctionnels</strong> : ils permettent de memoriser vos preferences (langue, recherches recentes) pour personnaliser votre experience.</li>
          </ul>

          <h3 id="gestion-preferences" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#gestion-preferences" @click="scrollTo('gestion-preferences', $event)">6.2 Gestion de vos preferences <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous pouvez a tout moment modifier vos preferences en matiere de cookies via les parametres de votre navigateur. La desactivation de certains cookies peut cependant limiter votre acces a certaines fonctionnalites de la plateforme. Pour plus d'informations, consultez notre <NuxtLink to="/privacy" class="text-primary-600 hover:underline">Politique de confidentialite</NuxtLink>.</p>
        </section>

        <section :id="sections[6].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[6].id" @click="scrollTo(sections[6].id, $event)">7. Limitation de responsabilite <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="contenu-plateforme" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#contenu-plateforme" @click="scrollTo('contenu-plateforme', $event)">7.1 Contenu de la plateforme <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Futela s'efforce de fournir des informations aussi precises et actualisees que possible. Toutefois, nous ne pouvons garantir l'exactitude, la completude, l'actualite ou l'exhaustivite des informations publiees sur la plateforme, notamment celles fournies par les utilisateurs (descriptions d'annonces, photos, prix, disponibilites).</p>

          <h3 id="intermediation" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#intermediation" @click="scrollTo('intermediation', $event)">7.2 Intermediation <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Futela agit exclusivement en qualite d'intermediaire technique entre proprietaires et locataires. A ce titre, Futela ne saurait etre tenue responsable :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>De la qualite, securite ou conformite des biens proposes a la location.</li>
            <li>Des litiges entre proprietaires et locataires.</li>
            <li>Des dommages directs ou indirects resultant de l'utilisation de la plateforme ou de l'impossibilite de l'utiliser.</li>
            <li>Des actes ou omissions des utilisateurs de la plateforme.</li>
            <li>De la perte de donnees ou de l'interruption de service.</li>
          </ul>

          <h3 id="force-majeure" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#force-majeure" @click="scrollTo('force-majeure', $event)">7.3 Force majeure <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Futela ne pourra etre tenue responsable de tout retard ou manquement dans l'execution de ses obligations resultant d'un evenement de force majeure, tel que defini par la legislation congolaise (catastrophes naturelles, conflits, pannes techniques majeures, decisions gouvernementales).</p>
        </section>

        <section :id="sections[7].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[7].id" @click="scrollTo(sections[7].id, $event)">8. Liens hypertextes <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="liens-sortants" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#liens-sortants" @click="scrollTo('liens-sortants', $event)">8.1 Liens sortants <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>La plateforme Futela peut contenir des liens hypertextes vers des sites tiers. Ces liens sont fournis a titre informatif uniquement. Futela n'exerce aucun controle sur le contenu de ces sites et decline toute responsabilite quant a leur contenu, leurs politiques de confidentialite ou leurs pratiques.</p>

          <h3 id="liens-entrants" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#liens-entrants" @click="scrollTo('liens-entrants', $event)">8.2 Liens entrants <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>La creation de liens hypertextes vers le site Futela est autorisee sans demande prealable, sous reserve que :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>Les liens ne portent pas atteinte a l'image de Futela.</li>
            <li>Les pages du site ne soient pas integrees dans les pages d'un autre site (framing).</li>
            <li>L'auteur du lien ne presente pas de maniere trompeuse la nature de sa relation avec Futela.</li>
          </ul>
          <p class="mt-2">Futela se reserve le droit de demander la suppression de tout lien qu'elle jugerait non conforme a ses interets.</p>
        </section>

        <section :id="sections[8].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[8].id" @click="scrollTo(sections[8].id, $event)">9. Droit applicable et juridiction competente <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Les presentes mentions legales sont regies par le droit de la Republique Democratique du Congo. Tout litige relatif a l'interpretation, l'execution ou la validite des presentes mentions legales sera soumis a la competence exclusive des tribunaux de Kinshasa, Republique Democratique du Congo.</p>
          <p class="mt-3">En cas de litige, les parties s'engagent a rechercher une solution amiable avant toute action judiciaire. A defaut d'accord amiable dans un delai de 30 jours, le litige pourra etre porte devant les juridictions competentes.</p>
          <p class="mt-3">Si l'une des clauses des presentes mentions legales venait a etre declaree nulle ou inapplicable par une decision de justice, les autres clauses resteraient en vigueur et conserveraient leur plein effet.</p>
        </section>

        <section :id="sections[9].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[9].id" @click="scrollTo(sections[9].id, $event)">10. Credits <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="conception-dev" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#conception-dev" @click="scrollTo('conception-dev', $event)">10.1 Conception et developpement <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>La plateforme Futela a ete concue et developpee par l'equipe technique de Futela. Les technologies utilisees comprennent des frameworks web modernes et des solutions cloud pour assurer performance, securite et evolutivite.</p>

          <h3 id="ressources-graphiques" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#ressources-graphiques" @click="scrollTo('ressources-graphiques', $event)">10.2 Ressources graphiques <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Certaines icones et elements graphiques utilises sur la plateforme proviennent de bibliotheques open source, utilisees conformement a leurs licences respectives. Les photographies d'illustration sont soit la propriete de Futela, soit utilisees sous licence.</p>

          <h3 id="polices" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#polices" @click="scrollTo('polices', $event)">10.3 Polices de caracteres <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Les polices de caracteres utilisees sur le site sont des polices libres de droits ou sous licence appropriee.</p>
        </section>

        <section :id="sections[10].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[10].id" @click="scrollTo(sections[10].id, $event)">11. Contact <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Pour toute question relative aux presentes mentions legales, vous pouvez nous contacter par les moyens suivants :</p>
          <div class="mt-3 p-4 bg-slate-50 rounded-lg space-y-1">
            <p><strong>Email</strong> : <NuxtLink to="/contact" class="text-primary-600 hover:underline">contact@futela.com</NuxtLink></p>
            <p><strong>Formulaire</strong> : <NuxtLink to="/contact" class="text-primary-600 hover:underline">Page de contact</NuxtLink></p>
            <p><strong>Adresse</strong> : Futela, Kinshasa, Republique Democratique du Congo</p>
            <p><strong>Telephone</strong> : +243 XXX XXX XXX</p>
          </div>
          <p class="mt-3">Nous nous engageons a traiter toute demande dans les meilleurs delais et a vous apporter une reponse appropriee.</p>
        </section>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="hidden lg:block">
        <div class="sticky top-24">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sur cette page</p>
          <ul class="space-y-1 border-l border-slate-200">
            <li v-for="(section, i) in sections" :key="section.id">
              <a
                :href="'#' + section.id"
                class="block pl-3 py-1 text-xs transition-colors border-l-2 -ml-px"
                :class="activeSection === section.id ? 'border-primary-600 text-primary-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-700'"
                @click="scrollTo(section.id, $event)"
              >
                {{ i + 1 }}. {{ section.label }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>
