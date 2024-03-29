import { defineClientConfig } from '@vuepress/client'
import { addIcons } from 'oh-vue-icons'
import {
  FaFortAwesome,
  FaSatelliteDish,
  FaTag,
  OiRocket,
  RiLinkM,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiFacebookBoxFill,
  RiTwitterFill,
  RiZhihuLine,
  HiMail,
  FaPaw,
  AiCvSquare,
  AiGoogleScholarSquare,
} from 'oh-vue-icons/icons'

addIcons(
  FaFortAwesome,
  FaSatelliteDish,
  FaTag,
  OiRocket,
  RiLinkM,
  RiGithubFill,
  RiLinkedinBoxFill,
  RiFacebookBoxFill,
  RiTwitterFill,
  RiZhihuLine,
  HiMail,
  FaPaw,
  AiCvSquare,
  AiGoogleScholarSquare
)

export default defineClientConfig({
  enhance({ app, router, siteData }) {},
  setup() {},
  rootComponents: [],
})
