import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import * as motion from "motion/react-client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from "next/image";
import { CardHeader } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from "next/link";
 
function CarouselComponent({ data, items }: { data: any; items?: any[] }) {
  const posts = items ?? [] ;
  return (
    <div
      className="flex-col items-center"
      style={{ maxWidth: "75%", justifySelf: "center" }}
    >
      <div className="flex justify-between" style={{ margin: "50px 0px" }}>
        <div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {data} Blogs
          </h2>
        </div>
        <div>
          <Link href="/all-blogs">
            <Button size="lg" className="group">
              View All{" "}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full "
      >
        <CarouselContent>
          {posts.map((post, index) => (
            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/3">
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-xs py-0">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <div className="w-full h-48 relative">
                        <Image
                          fill
                          src={post.image}
                          alt={post.title}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="secondary"
                          className="bg-background/80 backdrop-blur-xs"
                        >
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      {post.date}
                    </div>
                    <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="flex items-center text-primary font-medium group-hover:underline"
                    >
                      Read more{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

export default CarouselComponent