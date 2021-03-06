<template>
  <section>
    <v-btn
      v-show="fab"
      v-scroll="onScroll"
      fab
      dark
      fixed
      bottom
      right
      color="accent"
      @click="toTop"
    >
      <v-icon>keyboard_arrow_up</v-icon>
    </v-btn>
    <v-container fluid class="search-control">
      <form @submit.prevent="fetchData">
        <v-row
          class="filters d-flex justify-content-between align-items-center"
        >
          <v-col cols="auto"
            ><v-select
              v-model="filters.orderBy"
              :items="itemsOrderBy"
              item-text="title"
              item-value="value"
              :label="$t('search.orderBy')"
              outlined
              width="250px"
              @change="fetchData"
            ></v-select
          ></v-col>

          <v-col cols="auto" class="d-flex align-items-center">
            <v-checkbox
              id="has_comments"
              v-model="filters.has_comments"
              field="has_comments"
              :label="$t('search.hasComments')"
              class="mr-3"
              true-value="1"
              false-value="0"
              @change="fetchData"
            ></v-checkbox>

            <!--  <v-checkbox
              id="has_team"
              v-model="filters.has_team"
              field="has_team"
              label="By team"
              true-value="1"
              false-value="0"
              class="mr-3"
              @change="fetchData"
            ></v-checkbox> -->
          </v-col>
          <v-col>
            <v-text-field
              id="q"
              v-model="filters.q"
              field="q"
              class="combobox"
              outlined
              placeholder="rechercher dans les titres et les descriptions"
              @input="fetchData"
            >
              <template v-slot:append>
                <v-btn
                  :disabled="searching"
                  class="searchBtn"
                  height="auto"
                  text
                  :loading="searching"
                  type="submit"
                >
                  <v-icon>mdi-magnify</v-icon>
                  {{ $t('search.search') }}
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </form>
    </v-container>
    <v-container class="p-0 m-0 row-designs">
      <div v-if="searching" class="loader p-0">
        <Circle8></Circle8>
      </div>
      <div v-else class="pt-8 pl-0 pb-6 pr-0">
        <template v-if="(!designs.length)" class="pb-6 text-center">
          <v-alert
            border="left"
            color="#0f1219"
            dark
            width="60%"
            class="mx-auto deep-orange darken-4"
          >
            {{ $t('designs.noResult') }}
            <v-spacer />
            <nuxt-link :to="{ name: 'designs.search' }">
              <v-btn class="mt-3"
                ><v-icon right dark class="mx-2">reply</v-icon
                >{{ $t('designs.backToResults') }}</v-btn
              >
            </nuxt-link>
          </v-alert>
        </template>
        <template v-else id="row-designs">
          <!-- <nuxt-link :to="{ name: 'users.search' }">
            <v-btn class="mt-3"
              ><v-icon right dark class="mx-2">reply</v-icon
              >{{ $t('designs.backToResults') }}</v-btn
            >
          </nuxt-link> -->
          <v-row
            transition-duration="0.3s"
            item-selector=".item"
            class="mb-6 row-design"
            justify="center"
            no-gutters
          >
            <CoolLightBox
              :items="itemsDesigns"
              :index="index !== null ? parseInt(`${index}`) : index"
              :use-zoom-bar="true"
              :effect="'fade'"
              @close="index = null"
            >
            </CoolLightBox>
            <masonry
              :cols="{ default: 6, 1400: 4, 1000: 3, 700: 2, 400: 1 }"
              :gutter="{ default: '0px', 700: '15px' }"
              ><lazy-component
                v-for="(design, i) in designs"
                :key="`${i}-${design.id}`"
                :design="design"
                @lightbox="index = parseInt(`${i}`)"
              ></lazy-component
            ></masonry>
          </v-row>

          <infinite-loading
            ref="infiniteLoading"
            slot="append"
            :identifier="identifier"
            spinner="ring-loader"
            force-use-infinite-wrapper="row-designs"
            @infinite="infiniteHandler"
          >
          </infinite-loading>
        </template>
      </div>
    </v-container>
    <!-- Modal  -->
    <!-- <keep-alive> -->
    <base-modal
      :dialog.sync="visible"
      :fullscreen="fullscreen"
      @showDesign="styleModal()"
      @closeDialog="hideModal()"
    />
  </section>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
// import RingLoader from 'vue-spinner/src/RingLoader.vue'
import Circle8 from 'vue-loading-spinner/src/components/Circle8.vue'
import CoolLightBox from 'vue-cool-lightbox'
import 'vue-cool-lightbox/dist/vue-cool-lightbox.min.css'
export default {
  name: 'Search',
  layout: 'designs-listing',

  components: {
    // RingLoader,
    lazyComponent: () => import('@/components/designs/DesignCard.vue'),
    Circle8,
    CoolLightBox,
  },
  data() {
    return {
      designs: [],
      searching: true,
      loader: null,
      loadingSubmit: false,
      loaderPage: false,
      filters: {
        has_team: 0,
        has_comments: 0,
        q: '',
        orderBy: 'likes',
        page: 0,
      },
      itemsOrderBy: [
        { title: this.$i18n.t('search.latestFirst'), value: 'latest' },
        { title: this.$i18n.t('search.mostLikedFirst'), value: 'likes' },
      ],
      fullscreen: false,
      identifier: new Date(),
      fab: false,
      index: null,
      itemsDesigns: [],
    }
  },
  computed: {
    queryString() {
      return Object.keys(this.filters)
        .map((k) => `${k}=${this.filters[k]}`)
        .join('&')
    },
    ...mapGetters(['visible', 'modalComponent', 'folder']),
    url() {
      return `/search/designs?${this.queryString}`
    },
  },
  mounted() {
    this.fetchData()
  },

  methods: {
    ...mapActions(['showModal', 'hideModal']),
    async fetchData() {
      this.itemsDesigns = []
      this.searching = true
      this.identifier = new Date()
      this.filters.page = 1
      const response = await this.$axios.$get(this.url)
      this.designs = response.data

      this.designs.forEach((design) => {
        this.itemsDesigns.push({
          title: design.title === '' ? design.title : 'Sans Titre',
          description: design.description,
          src: design.images.extralarge,
        })
      })

      //  this.designs = Object.freeze(this.designs)
      this.searching = false
      this.filters.page += 1
    },

    infiniteHandler($state) {
      this.$axios
        .$get(this.url)
        .then((response) => {
          if (response.data.length > 0) {
            if (response.meta.current_page <= response.meta.last_page) {
              response.data.forEach((itemData) => {
                this.designs.push(itemData)
                this.itemsDesigns.push({
                  title: itemData.title === '' ? itemData.title : 'Sans Titre',
                  description: itemData.description,
                  src: itemData.images.extralarge,
                })
              })

              $state.loaded()
            } else {
              $state.loaded()

              $state.complete()
            }
          } else {
            $state.loaded()
            $state.complete()
          }
        })
        .catch((err) => {
          console.log(err)
        })
      this.filters.page += 1
    },

    styleModal() {
      this.fullscreen = true
    },
    onScroll(e) {
      if (typeof window === 'undefined') return
      const top = window.pageYOffset || e.target.scrollTop || 0
      this.fab = top > 20
    },
    toTop() {
      this.$vuetify.goTo(0)
    },
    goTo(to, folderName) {
      // this.hideModal()
      setTimeout(
        () => this.showModal({ componentName: to, folder: folderName }),
        300
      )
    },
  },
}
</script>

<style lang="scss" scoped>
.v-application a {
  text-decoration: none;
}
.v-select__selections input {
  display: none;
}
.container {
  max-width: 100%;
  padding: 0;
}
.search-control {
  max-width: 75%;
}
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
}
.col-md-2 {
  padding: 0;
}
.image {
  height: 300px;
  width: 300px;
  display: block;
  background-color: red;
}

body,
html {
  height: 100%; /* REMOVING THIS FIXES THE ISSUE */
  scroll-behavior: smooth;
}
.cool-lightbox
  .cool-lightbox__wrapper.cool-lightbox__wrapper--swipe
  .cool-lightbox__slide {
  opacity: 1 !important;
}
.row.row-design {
  display: contents !important;
}
</style>
