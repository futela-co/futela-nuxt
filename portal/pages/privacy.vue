<script setup lang="ts">
import { ShieldCheckIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'default',
  public: true,
})

useHead({
  title: 'Politique de confidentialite',
})

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'responsable', label: 'Responsable du traitement' },
  { id: 'collecte', label: 'Donnees collectees' },
  { id: 'utilisation', label: 'Utilisation des donnees' },
  { id: 'base-legale', label: 'Base legale' },
  { id: 'partage', label: 'Partage des donnees' },
  { id: 'conservation', label: 'Duree de conservation' },
  { id: 'securite', label: 'Securite' },
  { id: 'droits', label: 'Vos droits' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'mineurs', label: 'Mineurs' },
  { id: 'transfert', label: 'Transfert de donnees' },
  { id: 'modifications', label: 'Modifications' },
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
        <ShieldCheckIcon class="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Politique de confidentialite</h1>
        <p class="text-xs text-slate-400 mt-0.5">Derniere mise a jour : 1er mars 2026</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
      <!-- Content -->
      <div class="lg:col-span-3 space-y-10 text-sm text-slate-700 leading-relaxed [&_section]:scroll-mt-24 [&_h3]:scroll-mt-24">
        <section :id="sections[0].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[0].id" @click="scrollTo(sections[0].id, $event)">1. Introduction <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>La presente politique de confidentialite decrit comment Futela collecte, utilise, stocke et protege vos donnees personnelles lorsque vous utilisez notre plateforme de location et reservation immobiliere. Nous nous engageons a proteger votre vie privee et a traiter vos donnees personnelles de maniere transparente et securisee.</p>
          <p class="mt-3">Cette politique s'applique a tous les services proposes par Futela, y compris notre site web, nos applications mobiles et tout autre service lie a notre plateforme. En utilisant nos services, vous acceptez les pratiques decrites dans la presente politique.</p>
          <p class="mt-3">Nous vous encourageons a lire attentivement ce document pour comprendre comment nous traitons vos informations personnelles et quels sont vos droits en matiere de protection des donnees.</p>
        </section>

        <section :id="sections[1].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[1].id" @click="scrollTo(sections[1].id, $event)">2. Responsable du traitement <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Le responsable du traitement de vos donnees personnelles est :</p>
          <div class="mt-3 p-4 bg-slate-50 rounded-lg">
            <p><strong>Futela</strong></p>
            <p>Plateforme de location et reservation immobiliere</p>
            <p>Siege social : Kinshasa, Republique Democratique du Congo</p>
            <p>Email : contact@futela.com</p>
          </div>
          <p class="mt-3">Pour toute question relative au traitement de vos donnees personnelles, vous pouvez nous contacter a l'adresse ci-dessus ou via notre <NuxtLink to="/contact" class="text-primary-600 hover:underline">formulaire de contact</NuxtLink>.</p>
        </section>

        <section :id="sections[2].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[2].id" @click="scrollTo(sections[2].id, $event)">3. Donnees collectees <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="donnees-fournies" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#donnees-fournies" @click="scrollTo('donnees-fournies', $event)">3.1 Donnees que vous nous fournissez <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Lors de votre inscription et de votre utilisation de la plateforme, nous collectons les informations suivantes :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Donnees d'identification</strong> : nom, prenom, adresse email, numero de telephone, photo de profil.</li>
            <li><strong>Donnees de connexion</strong> : adresse email et mot de passe (stocke sous forme chiffree).</li>
            <li><strong>Donnees de profil</strong> : biographie, preferences de notification, parametres du compte.</li>
            <li><strong>Contenu publie</strong> : annonces, descriptions, photos de biens, messages, avis et evaluations.</li>
            <li><strong>Donnees de paiement</strong> : informations relatives aux transactions effectuees via le portefeuille Futela.</li>
          </ul>

          <h3 id="donnees-auto" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#donnees-auto" @click="scrollTo('donnees-auto', $event)">3.2 Donnees collectees automatiquement <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Lors de votre navigation sur notre plateforme, nous collectons automatiquement :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Donnees de navigation</strong> : adresse IP, type et version du navigateur, systeme d'exploitation, resolutions d'ecran.</li>
            <li><strong>Donnees d'utilisation</strong> : pages visitees, duree des visites, actions effectuees, recherches effectuees.</li>
            <li><strong>Donnees de localisation</strong> : localisation approximative basee sur l'adresse IP (nous ne collectons pas de geolocalisation precise sans votre consentement explicite).</li>
            <li><strong>Donnees de l'appareil</strong> : identifiant unique de l'appareil, modele, parametres de langue.</li>
          </ul>

          <h3 id="donnees-tiers" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#donnees-tiers" @click="scrollTo('donnees-tiers', $event)">3.3 Donnees provenant de tiers <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Nous pouvons recevoir des informations vous concernant de la part de tiers, notamment lorsque vous vous connectez via un service d'authentification tiers ou lorsqu'un autre utilisateur vous mentionne dans un avis.</p>
        </section>

        <section :id="sections[3].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[3].id" @click="scrollTo(sections[3].id, $event)">4. Utilisation des donnees <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Nous utilisons vos donnees personnelles pour les finalites suivantes :</p>

          <h3 id="fourniture-services" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#fourniture-services" @click="scrollTo('fourniture-services', $event)">4.1 Fourniture des services <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>Creer et gerer votre compte utilisateur.</li>
            <li>Traiter vos reservations et demandes de visite.</li>
            <li>Faciliter la communication entre proprietaires et locataires.</li>
            <li>Gerer les transactions financieres via le portefeuille.</li>
            <li>Afficher les annonces et resultats de recherche pertinents.</li>
          </ul>

          <h3 id="amelioration-services" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#amelioration-services" @click="scrollTo('amelioration-services', $event)">4.2 Amelioration des services <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>Analyser l'utilisation de la plateforme pour ameliorer l'experience utilisateur.</li>
            <li>Developper de nouvelles fonctionnalites basees sur les besoins des utilisateurs.</li>
            <li>Effectuer des analyses statistiques et des etudes de marche.</li>
            <li>Personnaliser le contenu et les recommandations.</li>
          </ul>

          <h3 id="communication-donnees" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#communication-donnees" @click="scrollTo('communication-donnees', $event)">4.3 Communication <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>Envoyer des notifications relatives a vos reservations, messages et activites.</li>
            <li>Communiquer des informations importantes sur votre compte ou nos services.</li>
            <li>Envoyer des communications marketing (avec votre consentement prealable).</li>
            <li>Repondre a vos demandes de support.</li>
          </ul>

          <h3 id="securite-prevention" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#securite-prevention" @click="scrollTo('securite-prevention', $event)">4.4 Securite et prevention des fraudes <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>Detecter et prevenir les activites frauduleuses ou non autorisees.</li>
            <li>Assurer la securite de la plateforme et des comptes utilisateurs.</li>
            <li>Verifier l'identite des utilisateurs lorsque necessaire.</li>
            <li>Respecter nos obligations legales.</li>
          </ul>
        </section>

        <section :id="sections[4].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[4].id" @click="scrollTo(sections[4].id, $event)">5. Base legale du traitement <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Nous traitons vos donnees personnelles sur les bases legales suivantes :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li><strong>Execution du contrat</strong> : le traitement est necessaire pour fournir les services auxquels vous avez souscrit (creation de compte, gestion de reservations, messagerie).</li>
            <li><strong>Consentement</strong> : pour certains traitements, notamment l'envoi de communications marketing et l'utilisation de cookies non essentiels, nous obtenons votre consentement prealable.</li>
            <li><strong>Interet legitime</strong> : nous traitons certaines donnees dans notre interet legitime, notamment pour ameliorer nos services, assurer la securite de la plateforme et prevenir les fraudes.</li>
            <li><strong>Obligation legale</strong> : certains traitements sont necessaires pour respecter nos obligations legales (conservation des donnees de facturation, reponse aux requisitions judiciaires).</li>
          </ul>
        </section>

        <section :id="sections[5].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[5].id" @click="scrollTo(sections[5].id, $event)">6. Partage des donnees <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="principe-general" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#principe-general" @click="scrollTo('principe-general', $event)">6.1 Principe general <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Nous ne vendons jamais vos donnees personnelles a des tiers. Nous ne partageons vos informations que dans les cas strictement necessaires au fonctionnement de la plateforme.</p>

          <h3 id="partage-utilisateurs" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#partage-utilisateurs" @click="scrollTo('partage-utilisateurs', $event)">6.2 Partage avec d'autres utilisateurs <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Dans le cadre d'une reservation ou d'une communication via la plateforme, certaines de vos informations (nom, photo de profil, avis) peuvent etre visibles par d'autres utilisateurs. Les proprietaires et locataires engages dans une transaction ont acces aux informations necessaires a la bonne execution de la location.</p>

          <h3 id="prestataires-techniques" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#prestataires-techniques" @click="scrollTo('prestataires-techniques', $event)">6.3 Prestataires techniques <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Nous faisons appel a des prestataires techniques de confiance pour le bon fonctionnement de la plateforme :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li>Hebergement et infrastructure cloud.</li>
            <li>Services d'envoi d'emails et de notifications.</li>
            <li>Services de paiement et traitement des transactions.</li>
            <li>Outils d'analyse et de mesure d'audience.</li>
          </ul>
          <p class="mt-2">Ces prestataires sont contractuellement tenus de traiter vos donnees conformement a nos instructions et a la reglementation applicable.</p>

          <h3 id="obligations-legales-partage" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#obligations-legales-partage" @click="scrollTo('obligations-legales-partage', $event)">6.4 Obligations legales <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Nous pouvons etre amenes a divulguer vos donnees personnelles en reponse a une demande legale valide (ordonnance judiciaire, requisition des autorites) ou lorsque nous estimons de bonne foi que la divulgation est necessaire pour proteger nos droits, votre securite ou celle d'autrui.</p>
        </section>

        <section :id="sections[6].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[6].id" @click="scrollTo(sections[6].id, $event)">7. Duree de conservation <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Nous conservons vos donnees personnelles aussi longtemps que necessaire pour les finalites pour lesquelles elles ont ete collectees :</p>
          <div class="mt-3 overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="border-b border-slate-200">
                  <th class="text-left py-2 pr-4 font-medium text-slate-900">Type de donnees</th>
                  <th class="text-left py-2 font-medium text-slate-900">Duree de conservation</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="py-2 pr-4">Donnees du compte</td>
                  <td class="py-2">Duree de l'existence du compte + 3 ans</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4">Donnees de reservation</td>
                  <td class="py-2">5 ans apres la fin de la reservation</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4">Donnees de facturation</td>
                  <td class="py-2">10 ans (obligation legale)</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4">Messages</td>
                  <td class="py-2">Duree du compte + 1 an</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4">Donnees de navigation</td>
                  <td class="py-2">13 mois maximum</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4">Cookies</td>
                  <td class="py-2">13 mois maximum</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-3">A l'issue de ces periodes, vos donnees sont supprimees ou anonymisees de maniere irreversible.</p>
        </section>

        <section :id="sections[7].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[7].id" @click="scrollTo(sections[7].id, $event)">8. Securite des donnees <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Nous mettons en oeuvre des mesures de securite techniques et organisationnelles appropriees pour proteger vos donnees personnelles contre tout acces non autorise, modification, divulgation ou destruction. Ces mesures comprennent :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li><strong>Chiffrement</strong> : les donnees sensibles sont chiffrees en transit (HTTPS/TLS) et au repos.</li>
            <li><strong>Authentification securisee</strong> : utilisation de tokens JWT, hachage des mots de passe avec des algorithmes robustes.</li>
            <li><strong>Controle d'acces</strong> : acces aux donnees restreint aux seuls employes et prestataires autorises, selon le principe du moindre privilege.</li>
            <li><strong>Surveillance</strong> : surveillance continue des systemes pour detecter les anomalies et tentatives d'intrusion.</li>
            <li><strong>Sauvegardes</strong> : sauvegardes regulieres et securisees des donnees pour assurer leur disponibilite.</li>
            <li><strong>Formation</strong> : sensibilisation reguliere de notre equipe aux bonnes pratiques de securite.</li>
          </ul>
          <p class="mt-3">Malgre nos efforts, aucun systeme de securite n'est infaillible. En cas de violation de donnees susceptible d'engendrer un risque pour vos droits et libertes, nous vous en informerons dans les meilleurs delais.</p>
        </section>

        <section :id="sections[8].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[8].id" @click="scrollTo(sections[8].id, $event)">9. Vos droits <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Conformement a la reglementation applicable en matiere de protection des donnees, vous disposez des droits suivants :</p>

          <h3 id="droit-acces" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#droit-acces" @click="scrollTo('droit-acces', $event)">9.1 Droit d'acces <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous avez le droit d'obtenir la confirmation que des donnees vous concernant sont traitees et d'acceder a ces donnees ainsi qu'a certaines informations complementaires (finalites, categories, destinataires, duree de conservation).</p>

          <h3 id="droit-rectification" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#droit-rectification" @click="scrollTo('droit-rectification', $event)">9.2 Droit de rectification <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous pouvez demander la correction de donnees inexactes ou incompletes vous concernant. Vous pouvez egalement mettre a jour vos informations directement depuis les parametres de votre compte.</p>

          <h3 id="droit-effacement" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#droit-effacement" @click="scrollTo('droit-effacement', $event)">9.3 Droit a l'effacement <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous pouvez demander la suppression de vos donnees personnelles dans certaines circonstances (donnees plus necessaires, retrait du consentement, traitement illicite). Ce droit n'est pas absolu et peut etre limite par nos obligations legales de conservation.</p>

          <h3 id="droit-limitation" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#droit-limitation" @click="scrollTo('droit-limitation', $event)">9.4 Droit a la limitation du traitement <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous pouvez demander la limitation du traitement de vos donnees dans certains cas, notamment lorsque vous contestez l'exactitude des donnees ou que vous vous opposez au traitement.</p>

          <h3 id="droit-portabilite" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#droit-portabilite" @click="scrollTo('droit-portabilite', $event)">9.5 Droit a la portabilite <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous avez le droit de recevoir vos donnees personnelles dans un format structure, couramment utilise et lisible par machine, et de les transmettre a un autre responsable du traitement.</p>

          <h3 id="droit-opposition" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#droit-opposition" @click="scrollTo('droit-opposition', $event)">9.6 Droit d'opposition <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous pouvez vous opposer a tout moment au traitement de vos donnees a des fins de prospection commerciale. Vous pouvez egalement vous opposer a un traitement fonde sur l'interet legitime pour des raisons tenant a votre situation particuliere.</p>

          <p class="mt-4">Pour exercer vos droits, contactez-nous a <NuxtLink to="/contact" class="text-primary-600 hover:underline">contact@futela.com</NuxtLink>. Nous nous engageons a repondre a votre demande dans un delai de 30 jours.</p>
        </section>

        <section :id="sections[9].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[9].id" @click="scrollTo(sections[9].id, $event)">10. Cookies et technologies similaires <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>

          <h3 id="definition-cookie" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#definition-cookie" @click="scrollTo('definition-cookie', $event)">10.1 Qu'est-ce qu'un cookie ? <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Un cookie est un petit fichier texte depose sur votre terminal (ordinateur, smartphone, tablette) lors de la visite d'un site web. Il permet au site de memoriser certaines informations pour faciliter votre navigation.</p>

          <h3 id="types-cookies" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#types-cookies" @click="scrollTo('types-cookies', $event)">10.2 Types de cookies utilises <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <ul class="list-disc pl-5 space-y-1.5 mt-2">
            <li><strong>Cookies essentiels</strong> : indispensables au fonctionnement de la plateforme (authentification, preferences de session, panier). Ils ne peuvent pas etre desactives.</li>
            <li><strong>Cookies de performance</strong> : nous permettent de mesurer l'audience et d'analyser la frequentation de notre plateforme pour en ameliorer le fonctionnement.</li>
            <li><strong>Cookies de fonctionnalite</strong> : memorisent vos preferences (langue, recherches recentes, favoris) pour personnaliser votre experience.</li>
          </ul>

          <h3 id="gestion-cookies" class="text-base font-medium text-slate-800 mt-4 mb-2 group/sub"><a href="#gestion-cookies" @click="scrollTo('gestion-cookies', $event)">10.3 Gestion des cookies <span class="opacity-0 group-hover/sub:opacity-100 text-primary-400">#</span></a></h3>
          <p>Vous pouvez configurer votre navigateur pour refuser les cookies ou etre averti lorsqu'un cookie est depose. Veuillez noter que la desactivation de certains cookies peut affecter le fonctionnement de la plateforme et limiter l'acces a certaines fonctionnalites.</p>
        </section>

        <section :id="sections[10].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[10].id" @click="scrollTo(sections[10].id, $event)">11. Protection des mineurs <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>La plateforme Futela est destinee aux personnes agees de 18 ans et plus. Nous ne collectons pas sciemment de donnees personnelles aupres de mineurs. Si nous decouvrons que des donnees d'un mineur ont ete collectees sans le consentement parental, nous prendrons les mesures necessaires pour les supprimer dans les meilleurs delais.</p>
          <p class="mt-3">Si vous etes parent ou tuteur et que vous pensez que votre enfant nous a fourni des donnees personnelles, veuillez nous contacter immediatement.</p>
        </section>

        <section :id="sections[11].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[11].id" @click="scrollTo(sections[11].id, $event)">12. Transfert international de donnees <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Vos donnees personnelles sont principalement stockees et traitees en Republique Democratique du Congo et dans des pays assurant un niveau de protection adequat des donnees personnelles.</p>
          <p class="mt-3">Dans le cas ou vos donnees seraient transferees vers un pays ne disposant pas d'un niveau de protection adequat, nous nous assurons que des garanties appropriees sont mises en place (clauses contractuelles types, certifications) pour proteger vos donnees conformement a la reglementation applicable.</p>
        </section>

        <section :id="sections[12].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[12].id" @click="scrollTo(sections[12].id, $event)">13. Modifications de la politique <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Nous pouvons mettre a jour cette politique de confidentialite a tout moment pour refleter les changements dans nos pratiques ou dans la reglementation applicable. La date de « derniere mise a jour » en haut de cette page indique la date de la derniere revision.</p>
          <p class="mt-3">En cas de modifications substantielles, nous vous informerons par email ou par une notification sur la plateforme avant l'entree en vigueur des changements. Nous vous encourageons a consulter regulierement cette page pour rester informe de la maniere dont nous protegeons vos donnees.</p>
        </section>

        <section :id="sections[13].id">
          <h2 class="text-lg font-semibold text-slate-900 mb-3 group"><a :href="'#' + sections[13].id" @click="scrollTo(sections[13].id, $event)">14. Nous contacter <span class="opacity-0 group-hover:opacity-100 text-primary-400">#</span></a></h2>
          <p>Pour toute question, demande ou reclamation relative a la presente politique de confidentialite ou au traitement de vos donnees personnelles, vous pouvez nous contacter :</p>
          <ul class="list-disc pl-5 space-y-1.5 mt-3">
            <li>Par email : <NuxtLink to="/contact" class="text-primary-600 hover:underline">contact@futela.com</NuxtLink></li>
            <li>Via notre <NuxtLink to="/contact" class="text-primary-600 hover:underline">formulaire de contact</NuxtLink></li>
            <li>Par courrier : Futela, Kinshasa, Republique Democratique du Congo</li>
          </ul>
          <p class="mt-3">Nous nous engageons a traiter votre demande dans un delai raisonnable et a vous tenir informe des suites donnees.</p>
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
