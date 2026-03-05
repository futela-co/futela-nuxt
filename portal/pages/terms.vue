<script setup lang="ts">
import { DocumentTextIcon } from '@heroicons/vue/24/outline'

const { t } = useLocale()

definePageMeta({
  layout: 'default',
  public: true,
})

useHead({
  title: computed(() => t('terms.title')),
})

const sections = computed(() => [
  { id: 'acceptation', label: t('terms.navAcceptation') },
  { id: 'description', label: t('terms.navDescription') },
  { id: 'inscription', label: t('terms.navInscription') },
  { id: 'obligations', label: t('terms.navObligations') },
  { id: 'annonces', label: t('terms.navAnnonces') },
  { id: 'reservations', label: t('terms.navReservations') },
  { id: 'paiements', label: t('terms.navPaiements') },
  { id: 'annulation', label: t('terms.navAnnulation') },
  { id: 'propriete', label: t('terms.navPropriete') },
  { id: 'responsabilite', label: t('terms.navResponsabilite') },
  { id: 'suspension', label: t('terms.navSuspension') },
  { id: 'litiges', label: t('terms.navLitiges') },
  { id: 'modifications', label: t('terms.navModifications') },
  { id: 'contact', label: t('terms.navContact') },
])

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
  sections.value.forEach(s => {
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
        <DocumentTextIcon class="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('terms.title') }}</h1>
        <p class="text-xs text-slate-400 mt-0.5">{{ t('terms.lastUpdated') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
      <!-- Content -->
      <div class="lg:col-span-3 space-y-10 text-sm text-slate-700 leading-relaxed [&_section]:scroll-mt-24 [&_h3]:scroll-mt-24">
        <section :id="sections[0].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[0].id" @click="scrollTo(sections[0].id, $event)">{{ t('terms.section1Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>{{ t('terms.section1Content1') }}</p>
          <p class="mt-3">{{ t('terms.section1Content2') }}</p>
          <p class="mt-3">{{ t('terms.section1Content3') }}</p>
        </section>

        <section :id="sections[1].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[1].id" @click="scrollTo(sections[1].id, $event)">{{ t('terms.section2Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>{{ t('terms.section2Intro') }}</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li v-html="t('terms.section2Item1')"></li>
            <li v-html="t('terms.section2Item2')"></li>
            <li v-html="t('terms.section2Item3')"></li>
            <li v-html="t('terms.section2Item4')"></li>
            <li v-html="t('terms.section2Item5')"></li>
            <li v-html="t('terms.section2Item6')"></li>
            <li v-html="t('terms.section2Item7')"></li>
          </ul>
          <p class="mt-3">{{ t('terms.section2Disclaimer') }}</p>
        </section>

        <section :id="sections[2].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[2].id" @click="scrollTo(sections[2].id, $event)">{{ t('terms.section3Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="creation-compte" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#creation-compte" @click="scrollTo('creation-compte', $event)">{{ t('terms.section3Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section3Sub1Content') }}</p>

          <h3 id="exactitude-informations" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#exactitude-informations" @click="scrollTo('exactitude-informations', $event)">{{ t('terms.section3Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section3Sub2Content') }}</p>

          <h3 id="securite-compte" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#securite-compte" @click="scrollTo('securite-compte', $event)">{{ t('terms.section3Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section3Sub3Content') }}</p>

          <h3 id="un-compte" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#un-compte" @click="scrollTo('un-compte', $event)">{{ t('terms.section3Sub4Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section3Sub4Content') }}</p>
        </section>

        <section :id="sections[3].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[3].id" @click="scrollTo(sections[3].id, $event)">{{ t('terms.section4Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="obligations-generales" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#obligations-generales" @click="scrollTo('obligations-generales', $event)">{{ t('terms.section4Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section4Sub1Intro') }}</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>{{ t('terms.section4Sub1Item1') }}</li>
            <li>{{ t('terms.section4Sub1Item2') }}</li>
            <li>{{ t('terms.section4Sub1Item3') }}</li>
            <li>{{ t('terms.section4Sub1Item4') }}</li>
            <li>{{ t('terms.section4Sub1Item5') }}</li>
          </ul>

          <h3 id="obligations-proprietaires" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#obligations-proprietaires" @click="scrollTo('obligations-proprietaires', $event)">{{ t('terms.section4Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section4Sub2Intro') }}</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>{{ t('terms.section4Sub2Item1') }}</li>
            <li>{{ t('terms.section4Sub2Item2') }}</li>
            <li>{{ t('terms.section4Sub2Item3') }}</li>
            <li>{{ t('terms.section4Sub2Item4') }}</li>
            <li>{{ t('terms.section4Sub2Item5') }}</li>
          </ul>

          <h3 id="obligations-locataires" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#obligations-locataires" @click="scrollTo('obligations-locataires', $event)">{{ t('terms.section4Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section4Sub3Intro') }}</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>{{ t('terms.section4Sub3Item1') }}</li>
            <li>{{ t('terms.section4Sub3Item2') }}</li>
            <li>{{ t('terms.section4Sub3Item3') }}</li>
            <li>{{ t('terms.section4Sub3Item4') }}</li>
          </ul>
        </section>

        <section :id="sections[4].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[4].id" @click="scrollTo(sections[4].id, $event)">{{ t('terms.section5Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="contenu-annonces" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#contenu-annonces" @click="scrollTo('contenu-annonces', $event)">{{ t('terms.section5Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section5Sub1Content') }}</p>

          <h3 id="contenu-interdit" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#contenu-interdit" @click="scrollTo('contenu-interdit', $event)">{{ t('terms.section5Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section5Sub2Intro') }}</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>{{ t('terms.section5Sub2Item1') }}</li>
            <li>{{ t('terms.section5Sub2Item2') }}</li>
            <li>{{ t('terms.section5Sub2Item3') }}</li>
            <li>{{ t('terms.section5Sub2Item4') }}</li>
            <li>{{ t('terms.section5Sub2Item5') }}</li>
          </ul>

          <h3 id="moderation" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#moderation" @click="scrollTo('moderation', $event)">{{ t('terms.section5Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section5Sub3Content') }}</p>
        </section>

        <section :id="sections[5].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[5].id" @click="scrollTo(sections[5].id, $event)">{{ t('terms.section6Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="processus-reservation" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#processus-reservation" @click="scrollTo('processus-reservation', $event)">{{ t('terms.section6Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section6Sub1Content') }}</p>

          <h3 id="engagements-reservation" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#engagements-reservation" @click="scrollTo('engagements-reservation', $event)">{{ t('terms.section6Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section6Sub2Content') }}</p>

          <h3 id="visites" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#visites" @click="scrollTo('visites', $event)">{{ t('terms.section6Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section6Sub3Content') }}</p>
        </section>

        <section :id="sections[6].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[6].id" @click="scrollTo(sections[6].id, $event)">{{ t('terms.section7Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="portefeuille" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#portefeuille" @click="scrollTo('portefeuille', $event)">{{ t('terms.section7Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section7Sub1Content') }}</p>

          <h3 id="frais-service" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#frais-service" @click="scrollTo('frais-service', $event)">{{ t('terms.section7Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section7Sub2Content') }}</p>

          <h3 id="facturation" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#facturation" @click="scrollTo('facturation', $event)">{{ t('terms.section7Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section7Sub3Content') }}</p>
        </section>

        <section :id="sections[7].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[7].id" @click="scrollTo(sections[7].id, $event)">{{ t('terms.section8Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="annulation-locataire" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#annulation-locataire" @click="scrollTo('annulation-locataire', $event)">{{ t('terms.section8Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section8Sub1Content') }}</p>

          <h3 id="annulation-proprietaire" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#annulation-proprietaire" @click="scrollTo('annulation-proprietaire', $event)">{{ t('terms.section8Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section8Sub2Content') }}</p>

          <h3 id="remboursements" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#remboursements" @click="scrollTo('remboursements', $event)">{{ t('terms.section8Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section8Sub3Content') }}</p>
        </section>

        <section :id="sections[8].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[8].id" @click="scrollTo(sections[8].id, $event)">{{ t('terms.section9Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>{{ t('terms.section9Content1') }}</p>
          <p class="mt-3">{{ t('terms.section9Content2') }}</p>
          <p class="mt-3">{{ t('terms.section9Content3') }}</p>
        </section>

        <section :id="sections[9].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[9].id" @click="scrollTo(sections[9].id, $event)">{{ t('terms.section10Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="role-intermediaire" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#role-intermediaire" @click="scrollTo('role-intermediaire', $event)">{{ t('terms.section10Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section10Sub1Content') }}</p>

          <h3 id="contenu-utilisateurs" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#contenu-utilisateurs" @click="scrollTo('contenu-utilisateurs', $event)">{{ t('terms.section10Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section10Sub2Content') }}</p>

          <h3 id="disponibilite-plateforme" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#disponibilite-plateforme" @click="scrollTo('disponibilite-plateforme', $event)">{{ t('terms.section10Sub3Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section10Sub3Content') }}</p>
        </section>

        <section :id="sections[10].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[10].id" @click="scrollTo(sections[10].id, $event)">{{ t('terms.section11Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="suspension-utilisateur" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#suspension-utilisateur" @click="scrollTo('suspension-utilisateur', $event)">{{ t('terms.section11Sub1Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section11Sub1Content') }}</p>

          <h3 id="suspension-futela" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#suspension-futela" @click="scrollTo('suspension-futela', $event)">{{ t('terms.section11Sub2Title') }} <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>{{ t('terms.section11Sub2Content') }}</p>
        </section>

        <section :id="sections[11].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[11].id" @click="scrollTo(sections[11].id, $event)">{{ t('terms.section12Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>{{ t('terms.section12Content1') }}</p>
          <p class="mt-3">{{ t('terms.section12Content2') }}</p>
        </section>

        <section :id="sections[12].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[12].id" @click="scrollTo(sections[12].id, $event)">{{ t('terms.section13Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>{{ t('terms.section13Content1') }}</p>
          <p class="mt-3">{{ t('terms.section13Content2') }}</p>
        </section>

        <section :id="sections[13].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[13].id" @click="scrollTo(sections[13].id, $event)">{{ t('terms.section14Title') }} <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>{{ t('terms.section14Intro') }}</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li>{{ t('terms.section14Email') }} <NuxtLink to="/contact" class="text-primary-600 hover:underline">contact@futela.com</NuxtLink></li>
            <li>{{ t('terms.section14Form') }} <NuxtLink to="/contact" class="text-primary-600 hover:underline">{{ t('terms.section14FormLink') }}</NuxtLink></li>
            <li>{{ t('terms.section14Mail') }}</li>
          </ul>
        </section>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="hidden lg:block">
        <div class="sticky top-24">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{{ t('terms.onThisPage') }}</p>
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
