import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => {
  return {
    siteTitle: process.env.SWAGGER_SITE_TITLE ?? 'Swagger Site Title',
    docTitle: process.env.SWAGGER_DOC_TITLE ?? 'Swagger Documentation Title',
    docDescription: process.env.SWAGGER_DOC_DESCRIPTION ?? 'Swagger Documentation Description',
    docVersion: process.env.SWAGGER_DOC_VERSION ?? '1.0',
  };
});
