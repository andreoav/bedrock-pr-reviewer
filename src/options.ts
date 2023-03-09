import * as core from '@actions/core'
import {minimatch} from 'minimatch'

export class Prompts {
  review_beginning: string
  review_file: string
  review_file_diff: string
  review_patch_begin: string
  review_patch: string
  summarize_beginning: string
  summarize_file_diff: string
  summarize: string
  summarize_release_notes: string

  constructor(
    review_beginning = '',
    review_file = '',
    review_file_diff = '',
    review_patch_begin = '',
    review_patch = '',
    summarize_beginning = '',
    summarize_file_diff = '',
    summarize = ''
    summarize_release_notes = ''
  ) {
    this.review_beginning = review_beginning
    this.review_file = review_file
    this.review_file_diff = review_file_diff
    this.review_patch_begin = review_patch_begin
    this.review_patch = review_patch
    this.summarize_beginning = summarize_beginning
    this.summarize_file_diff = summarize_file_diff
    this.summarize = summarize
    this.summarize_release_notes = summarize_release_notes
  }

  render_review_beginning(inputs: Inputs): string {
    return inputs.render(this.review_beginning)
  }

  render_review_file(inputs: Inputs): string {
    return inputs.render(this.review_file)
  }

  render_review_file_diff(inputs: Inputs): string {
    return inputs.render(this.review_file_diff)
  }

  render_review_patch_begin(inputs: Inputs): string {
    return inputs.render(this.review_patch_begin)
  }

  render_review_patch(inputs: Inputs): string {
    return inputs.render(this.review_patch)
  }

  render_summarize_beginning(inputs: Inputs): string {
    return inputs.render(this.summarize_beginning)
  }

  render_summarize_file_diff(inputs: Inputs): string {
    return inputs.render(this.summarize_file_diff)
  }

  render_summarize(inputs: Inputs): string {
    return inputs.render(this.summarize)
  }

  render_summarize_release_notes(inputs: Inputs): string {
    return inputs.render(this.summarize_release_notes)
  }
}

export class Inputs {
  title: string
  description: string
  filename: string
  file_content: string
  file_diff: string
  patch: string
  diff: string

  constructor(
    title = '',
    description = '',
    filename = '',
    file_content = '',
    file_diff = '',
    patch = '',
    diff = ''
  ) {
    this.title = title
    this.description = description
    this.filename = filename
    this.file_content = file_content
    this.file_diff = file_diff
    this.patch = patch
    this.diff = diff
  }

  render(content: string): string {
    if (!content) {
      return ''
    }
    if (this.title) {
      content = content.replace('$title', this.title)
    }
    if (this.description) {
      content = content.replace('$description', this.description)
    }
    if (this.filename) {
      content = content.replace('$filename', this.filename)
    }
    if (this.file_content) {
      content = content.replace('$file_content', this.file_content)
    }
    if (this.file_diff) {
      content = content.replace('$file_diff', this.file_diff)
    }
    if (this.patch) {
      content = content.replace('$patch', this.patch)
    }
    if (this.diff) {
      content = content.replace('$diff', this.diff)
    }
    return content
  }
}

export class Options {
  debug: boolean
  chatgpt_reverse_proxy: string
  review_comment_lgtm: boolean
  path_filters: PathFilter
  system_message: string

  constructor(
    debug: boolean,
    chatgpt_reverse_proxy: string,
    review_comment_lgtm = false,
    path_filters: string[] | null = null,
    system_message = ''
  ) {
    this.debug = debug
    this.chatgpt_reverse_proxy = chatgpt_reverse_proxy
    this.review_comment_lgtm = review_comment_lgtm
    this.path_filters = new PathFilter(path_filters)
    this.system_message = system_message
  }

  check_path(path: string): boolean {
    const ok = this.path_filters.check(path)
    core.info(`checking path: ${path} => ${ok}`)
    return ok
  }
}

export class PathFilter {
  private rules: [string /* rule */, boolean /* exclude */][]

  constructor(rules: string[] | null = null) {
    this.rules = []
    if (rules) {
      for (const rule of rules) {
        const trimmed = rule?.trim()
        if (trimmed) {
          if (trimmed.startsWith('!')) {
            this.rules.push([trimmed.substring(1).trim(), true])
          } else {
            this.rules.push([trimmed, false])
          }
        }
      }
    }
  }

  check(path: string): boolean {
    let include_all = this.rules.length == 0
    let matched = false
    for (const [rule, exclude] of this.rules) {
      if (exclude) {
        if (minimatch(path, rule)) {
          return false
        }
        include_all = true
      } else {
        if (minimatch(path, rule)) {
          matched = true
          include_all = false
        } else {
          return false
        }
      }
    }
    return include_all || matched
  }
}
