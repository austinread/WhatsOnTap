﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WhatsOnTap.Models;

namespace WhatsOnTap.Migrations
{
    [DbContext(typeof(WhatsOnTapContext))]
    [Migration("20181122020829_AddLabel")]
    partial class AddLabel
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.4-rtm-31024");

            modelBuilder.Entity("WhatsOnTap.Models.Beer", b =>
                {
                    b.Property<long?>("id")
                        .ValueGeneratedOnAdd();

                    b.Property<double>("abv");

                    b.Property<string>("description");

                    b.Property<double>("fg");

                    b.Property<double>("ibu");

                    b.Property<long?>("labelId");

                    b.Property<string>("name");

                    b.Property<double>("og");

                    b.Property<double>("srm");

                    b.Property<long>("styleId");

                    b.HasKey("id");

                    b.ToTable("Beer");
                });

            modelBuilder.Entity("WhatsOnTap.Models.Style", b =>
                {
                    b.Property<long?>("id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("name");

                    b.HasKey("id");

                    b.ToTable("Style");
                });

            modelBuilder.Entity("WhatsOnTap.Models.Tap", b =>
                {
                    b.Property<long?>("id")
                        .ValueGeneratedOnAdd();

                    b.Property<long>("beerId");

                    b.Property<int>("order");

                    b.HasKey("id");

                    b.ToTable("Tap");
                });
#pragma warning restore 612, 618
        }
    }
}
