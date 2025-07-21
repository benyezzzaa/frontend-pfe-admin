import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProduitModule } from './modules/produit/produit.module';
import { User } from './modules/users/users.entity';
import { CategorieProduitModule } from './modules/categorie-produit/categorie-produit.module';
import { UniteService } from './modules/unite/unite.service';
import { UniteModule } from './modules/unite/unite.module';
import { Client } from './modules/client/client.entity';
import { ClientModule } from './modules/client/client.module';
import { Unite } from './modules/unite/unite.entity';

import { VisiteModule } from './modules/Visite/visite.module';
import { LigneCommande } from './modules/lignecommande/lignecommande.entity';
import { CommandeModule } from './modules/commande/commande.module';
import { LigneCommandeModule } from './modules/lignecommande/lignecommande.module';

import { Commande } from './modules/commande/commande.entity';
import { Facture } from './modules/facture/facture.entity'; // ✅ Ajout de l'entité Facture
import { Reglement } from './modules/reglement/reglement.entity'; // ✅ Ajout de l'entité Reglement
import { ReglementModule } from './modules/reglement/reglement.module';
import { TypeReglementModule } from './modules/type-reglement/type-reglement.module';
import { ReglementFactureModule } from './modules/reglement-facture/reglement-facture.module';
import { TypeReglement } from './modules/type-reglement/typeReglement.entity';
import { FactureModule } from './modules/facture/facture.module';
import { ReglementFacture } from './modules/reglement-facture/reglement-facture.entity';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RaisonVisite } from './modules/raison-visite/raison-visite.entity';
import { RaisonVisiteModule } from './modules/raison-visite/raison-visite.module';
import { ObjectifCommercialModule } from './modules/ObjectifCommercial/objectif-commercial.module';
import { PromotionModule } from './modules/Promotion/promotion.module';
import { Circuit } from './modules/circuit/circuit.entity';
import { CircuitModule } from './modules/circuit/circuit.module';
import { ReclamationModule } from './modules/reclamation/reclamation.module';
import { SatisfactionModule } from './modules/SatisfactionSurveyV2/satisfaction.module';
import { SurveyModule } from './modules/survey/survey.module';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CategorieClient } from './modules/client/categorie-client.entity';
import { CategorieClientModule } from './modules/client/categorie-client.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'fatma',
      database: process.env.DATABASE_NAME || 'postgres',
      autoLoadEntities: true,
      synchronize: true, // ⚠️ Mettre `false` en production et utiliser des migrations
      entities: [Commande, Facture, Reglement,TypeReglement, LigneCommande, User, Client, 
        Unite,ReglementFacture,RaisonVisiteModule,ObjectifCommercialModule,PromotionModule,CircuitModule,CategorieClient], // ✅ Ajout de `Facture` et `Reglement`
    }),
     // ✅ Mailer configuration (e.g. for password reset)
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'fatmabenyezza90@gmail.com',
          pass: process.env.EMAIL_PASS || 'frmo kdfw bqpr iari',

        },
      },
      defaults: {
        from: '"Sales Force App" <no-reply@salesforce.com>',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    UsersModule,
    AuthModule,
    ProduitModule,
    CategorieProduitModule,
    UniteModule,
    ClientModule,
    UniteModule,
    VisiteModule,
    LigneCommandeModule,
    CommandeModule,
    ReglementModule,
    TypeReglementModule,
    ReglementFactureModule,
    FactureModule,
    DashboardModule,
    RaisonVisiteModule,
    ObjectifCommercialModule,
    PromotionModule,
    CircuitModule,
    ReclamationModule,
    SatisfactionModule,
    SurveyModule,
    CategorieClientModule,

  ],
  providers: [],
})
export class AppModule {}
