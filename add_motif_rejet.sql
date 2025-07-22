-- Ajouter la colonne motif_rejet à la table commande
ALTER TABLE commande ADD COLUMN IF NOT EXISTS motif_rejet TEXT;

-- Mettre à jour les commandes existantes avec statut 'rejetee' pour avoir un motif par défaut
UPDATE commande SET motif_rejet = 'Motif non spécifié' WHERE statut = 'rejetee' AND motif_rejet IS NULL; 