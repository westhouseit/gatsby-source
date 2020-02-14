# Gatsby Source Directus

**:warning: This project is under heavy development, so breaking changes may occur on our road to a stable v1.0.0. Any bug report will be highly appreciated.**

A [Gatsby](https://www.gatsbyjs.org/) source plugin to pull content from a [Directus CMS](https://directus.io/) backend.

Inspired by the [gatsby-source-directus7](https://github.com/Jonesus/gatsby-source-directus7) plugin by [Joonas Palosuo](https://github.com/Jonesus)

## Features

- Exposes all custom content types & associated records created in Directus as distinct nodes in the Gatsby GraphQL layer
- Mirrors O2M, M2O, M2M, and "File" relations between content types in Directus in the Graph QL layer
- Downloads files hosted in Directus for usage with other [Gatsby transformer plugins](https://www.gatsbyjs.org/plugins/?=gatsby-transformer)

## Installation

Installing the plugin is no different than installing other Gatsby source plugins.

1. Create a gatsby project. For help, see the Gatsby quick start guide [here](https://www.gatsbyjs.org/docs/quick-start)
2. Install the plugin using `npm install --save @directus/gatsby-source-directus`
3. Edit your `gatsby-config.js`. See below for details.

## Configuration

### Options

Find details regarding the `options` object schema below.

| Field              | Type                                                         | Default                     | Note                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| url                | `string`                                                     | `void`                      | **Required** - The base url for the project's Directus API.                                                                                                                                                                            |
| project            | `string`                                                     | `void`                      | **Required** - The target projects name in Directus.                                                                                                                                                                                   |
| auth               | `{ email: string; password: string; } \| { token: string; }` | `void`                      | Either the login credentials for the user to authenticate the Directus API with, OR a token used to authenticate with the Directus API. If both are provided, the token is preferred. If neither are provided, the public API is used. |
| targetStatuses     | `string[] \| void`                                           | `["published", "__NONE__"]` | A set of allowed statuses records must match to be included in the mesh. A value of `null` or `undefined` includes content of any status. The string `"__NONE__"` can be used to allow records with no status defined.                 |
| allowCollections   | `string[] \| void`                                           | `void`                      | A set of collection names to allow. Only collections with names that appear in the set will be included. `void` includes all collections.                                                                                              |
| blockCollections   | `string[] \| void`                                           | `void`                      | A set of collection names to block. Only collections with names that **don't** appear in the set will be included. `void` blocks no collections.                                                                                       |
| typePrefix         | `string`                                                     | `"Directus"`                | The prefix to use for the node types exposed in the GraphQL layer.                                                                                                                                                                     |
| includeJunctions   | `boolean`                                                    | `false`                     | Allows inclusion of the junction tables that manage M2M relations in the GraphQL layer.                                                                                                                                                |
| downloadFiles      | `boolean`                                                    | `true`                      | Indicates if files should be downloaded to disk. Enables images to be used with other transform plugins. Setting to false could be useful if the project has many files.                                                               |
| customRecordFilter | `((record: any, collection: string) => boolean) \| void`     | `void`                      | A function executed for each record, returning whether the record should be included in the content mesh. **Note:** If provided, this will **override** any `targetStatuses` value.                                                    |

### Directus Config

Setting up a separate user in Directus for usage with this plugin is recommended. Make sure you grant `read` privileges to the user on all tables, including system tables. See more in the [Directus docs](https://docs.directus.io/guides/permissions.html#collection-level).

### Example Configurations

Basic configuration including only published or statusless items.

```js
// gatsby-config.js

module.exports = {
  // ...
  plugins: [
    {
      // ...
      resolve: '@directus/gatsby-source-directus',
      options: {
        url: 'https://directus.example.com',
        project: '_',
        auth: {
          email: 'admin@example.com',
          password: 'example',
        },
        targetStatuses: ['published', '__NONE__'],
      },
      // ...
    },
  ],
  // ...
};
```

Custom configuration including published, draft, or statusless items. Blocks the `super_secret_stuff` collection, and will **not** download files for processing by `gatsby-image`.

```js
// gatsby-config.js

module.exports = {
  // ...
  plugins: [
    {
      // ...
      resolve: '@directus/gatsby-source-directus',
      options: {
        url: 'https://directus.example.com',
        project: '_',
        auth: {
          email: 'admin@example.com',
          password: 'example',
        },
        targetStatuses: ['published', 'draft', '__NONE__'],
        blockCollections: ['super_secret_stuff'],
        downloadFiles: false,
      },
      // ...
    },
  ],
  // ...
};
```

## Usage Examples

### Sample `gatsby-node.js`

```js
const path = require('path');

module.exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // Sample query for all blog posts.
  const response = await graphql(`
    query GatsbyBlogPostsQuery {
      allDirectusBlogPost {
        edges {
          node {
            directusId
            title
            author
            body
            preview
            created
            slug
          }
        }
      }
    }
  `);

  // Destructure response to get post data
  const {
    data: {
      allDirectusBlogPost: { edges: posts = [] },
    },
  } = response;

  // Build a new page that could list the blog posts
  createPage({
    path: '/blog',
    component: path.resolve('./src/templates/blog-post-list.js'),
    context: posts,
  });

  // Build a new page for each blog post
  posts.forEach(({ node: post }) => {
    createPage({
      path: `/blog/${post.slug}`,
      component: path.resolve('./src/templates/blog-post.js'),
      context: post,
    });
  });
};
```

### Example Using Static Query

```js
// ./gatsby-node.js
const path = require('path');

module.exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  // Sample query for all blog posts.
  const response = await graphql(`
    query GatsbyNodeQuery {
      allDirectusBlogPost {
        edges {
          node {
            directusId
          }
        }
      }
    }
  `);

  // Destructure response to get post IDs
  const {
    data: {
      allDirectusBlogPost: { edges: posts = [] },
    },
  } = response;

  // Build a new page for each blog post, passing the directusId
  // via `context` for the static query
  posts.forEach(({ node: post }) => {
    createPage({
      path: `/blog/${post.slug}`,
      component: path.resolve('./src/templates/blog-post.js'),
      context: post,
    });
  });
};
```

```js
// ./src/templates/blog-post.js
import { graphql } from 'gatsby';
import React from 'react';

// A static query, the results from which
// will be passed to our component. Uses the 'directusId' property
// passed via the `createPage` context config to retrieve the blog post.
export const query = graphql`
  query($directusId: Int!) {
    directusBlogPost(directusId: {eq: $directusId}) {
      directusId
      title
      author
      body
      preview
      created
      slug
    }
  }
`;

// The component we'll render for a given blog post
const BlogPost = ({
  data: { directusBlogPost: post }
}) => {
  return (
    // ... Some markup consuming the 'post' data
  );

};

export default BlogPost;
```

### Sample Using a Page Query

```js
// ./src/pages/blog.js
import { graphql } from 'gatsby';
import React from 'react';

// The query used to provide the page data
// for the '/blog' route.
export const pageQuery = graphql`
    query BlogQuery {
      allDirectusBlogPost {
        edges {
          node {
            directusId
            title
            author
            body
            preview
            created
            slug
          }
        }
      }
    }
`;

// The component that will render a list of blog posts
const BlogPage = ({
    data,
    location
}) => {

  // Extracting post data from props.
  const {
      allDirectusBlogPost: posts = [],
  } = data;

  return (
    // ... Some markup consuming the list of 'posts'
  );

};

export default BlogPage;

```

## Query Examples

### Basic query for a list of blog posts

```
query BlogQuery {
  allDirectusBlogPost {
    edges {
      node {
        directusId
        title
        author
        body
        preview
        created
        slug
      }
    }
  }
}
```

### Basic query for a single blog post (via directusId)

```
query BlogPostQuery($directusId: Int!) {
  directusBlogPost(directusId: {eq: $directusId}) {
    directusId
    title
    author
    body
    preview
    created
    slug
  }
}
```

### Filtered & sorted list of blog posts

```
query BlogPostQuery {
  allDirectusBlogPost(
    filter: {created: {gte: "2020-01-01 00:00:00"}},
    sort: {order: DESC, fields: created}
  ) {
    edges {
      node {
        directusId
        title
        author
        body
        preview
        created
        slug
      }
    }
  }
}
```

### Join for a list of products & all projects associated with each product.

Assumes a field `related_projects` exists as the join field on the `product` table in Directus.

```
query ProductQuery {
  allDirectusProduct {
    edges {
      node {
        directusId
        name
        created
        related_projects {
          directusId
          name
        }
      }
    }
  }
}
```

### Join for the product category details via product ID.

Assumes a field `owning_product_category` exists as the join field on the `product` table in Directus.

```
query ProductQuery($directusId: Int!) {
  directusProduct(directusId: {eq: $directusId}) {
    directusId
    name
    created
    owning_product_category {
      directusId
      name
      description
    }
  }
}
```

### Join for the images (stored as Directus files) associated with a product

Assumes a field `images` exists as the join field on the `product` table in Directus.

```
query ProductQuery($directusId: Int!) {
  directusProduct(directusId: {eq: $directusId}) {
    directusId
    name
    created
    images {
      id
      data {
        full_url
        thumbnails {
          height
          width
          dimension
          url
        }
      }
      description
      type
      title
    }
  }
}
```

### Sample thumbnail query using `gatsby-image`

Builds a set of thumbnails (150px x 150px) for all images. Assumes `downloadFiles` was `true` in the plugin's config. The `originalName` property should match the corresponding `directusFile` `filename` property.

```
query AllImageThumbnails {
  allImageSharp {
    edges {
      node {
        sizes(maxHeight: 150, maxWidth: 150) {
          src
          originalName
        }
      }
    }
  }
}
```

## Notes

### Known Limitations

For the a collection type to exist in the GraphQL layer, there must be at least one record processed by the plugin belonging to the collection.

E.g. if either no records exist for the collection, or they are all filtered by the plugin configuration, that collection will **not** appear in the GraphQL layer, and any attempts to query against it will throw an error.

Similarly, for a field defined as a M2O, O2M, M2M, or File(s) relation to exist in the GraphQL schema for a given collection, there must exist **at least one** record that has a non-null value for that field. Attempts to query fields where no relations have been defined in Directus will throw an error.

E.g. if we have a `products` collection in Directus that has a `reviews` field defined as a O2M relation to a `review` collection, if **all** `products` have no `reviews`, the `reviews` field will not be available in the `directusProducts` GraphQL schema, and attempts to execute a `query { directusProducts { reviews { ... } } }` query will throw an error.

### Development

The project is written in TypeScript. You can clone the repo and use the command `npm run dev` to start TypeScript in watch-mode. `npm run build` builds the project.

### Release

Before making a new release, be sure that the project passes linting and the tests, otherwise it won't be published to NPM.

First, we will bump the package version number, commit the change and finally tag the commit with our new version. This is done with the help of the NPM version command (see `npm help version`).

```sh
npm run release [<newversion> | major | minor | patch]
```

Push the release commit and then the release tag to the Github repository:

```sh
git push --follow-tags
```

Github will take care of building the project, running all the tests, and finally publishing the package to the NPM registry.

The next step is to edit the auto generated release draft on Github to create a new release attached to the tag that we previously pushed.

The release draft may contain some useless changes, so remove any unnecessary logs from it. Once the release draft is ready, it can be published.
